
import { Action, ActionOption, ActionOptionTypes, ActionOptionValueMap } from 'continui-action';
import { GitHubReleaseActionContext } from './gitHubReleaseActionContext';
import { TextTemplateService } from 'continui-services';

import * as fs from 'fs';
import * as path from 'path';

import axios from 'axios';

const privateScope = new WeakMap<GitHubReleaseAction, {
  textTemplateService: TextTemplateService,
}>();

/**
 * Represents a git hub release action that can create well defined releases on Git Hub.
 */
export class GitHubReleaseAction implements Action<GitHubReleaseActionContext> {

  constructor(textTemplateService: any) {
    privateScope.set(this, {
      textTemplateService,
    });
  }

    /**
     * Get the action identifier.
     */
  public get identifier(): string { return 'github-release'; }
    
    /**
     * Get the action name.
     */
  public get name(): string { return 'Git Hub Release'; }

    /**
     * Get the action description.
     */
  public get description(): string { 
    return 'Represents a git hub release action that can create well defined releases on Git Hub.';
  }

    /**
     * Represents the action otions used to execute the action.
     */
  public get options(): ActionOption[] { return this.getOptions(); }

    /**
     * Creates a restoration point based on the action to rollback the changes if the pipe
     * flow breaks.
     * @param actionOptionsValueMap Represents the options values provided to run the action.
     * @param context Represents the action execution context.
     */
  public createsRestaurationPoint(actionOptionValueMap: ActionOptionValueMap,
                                  context: GitHubReleaseActionContext)
                                    : void | Promise<void> | IterableIterator<any> {
       // NOTHING to do here.
  }
    
    /**
     * Execute the action base on the given options and context.
     * @param actionOptionsValueMap Represents the options values provided to run the action.
     * @param context Represents the action execution context.
     */
  public* execute(actionOptionValueMap: ActionOptionValueMap,
                  context: GitHubReleaseActionContext)
                    : void | Promise<void> | IterableIterator<any> {

    const assets:string[] = this.getNormalizedAssetsPaths(actionOptionValueMap.asset || []);

    yield this.createRelease(actionOptionValueMap, context);        

    yield assets.map((asset) => {
      const fileStats: fs.Stats = fs.statSync(asset);
      const uploadUrl: string = context.releaseUploadURL.replace('{?name,label}', '?name=' + 
                                                                  path.basename(asset));

      return this.uploadAsset(uploadUrl, fs.createReadStream(asset) ,{
        'Content-Type': 'multipart/form-data',
        'Content-Length': fileStats.size,
        Authorization: 'token ' + actionOptionValueMap.token,
      });
    });  
    
    context.assetsHasBeenUpload = !!assets.length;
  }    
    
    /**
     * Restore the action base on the given options and context.
     * @param context Represents the action execution context.
     */
  public* restore(actionOptionValueMap: ActionOptionValueMap,
                  context: GitHubReleaseActionContext)
                    : void | Promise<void> | IterableIterator<any> {
    if (context.releaseId) {           
      yield axios.delete(
        `${this.getBaseReleaseApiUrl(actionOptionValueMap)}/` + context.releaseId, {
          headers: {
            Authorization: 'token ' + actionOptionValueMap.token,
          },
        },
      );              
    }
  }

    /**
     * Creates and return an new context bases on the provided options.
     * @param actionOptionsValueMap Represents the options values provided to run the action.
     * @returns A new execution context bases on the provided options.
     */
  public createsContextFromOptionsMap(actionOptionsValueMap: ActionOptionValueMap)
    : GitHubReleaseActionContext {
    return  new GitHubReleaseActionContext();
  }

    /**
     * Creates a Git Hub release bases on the action options value.
     * @param actionOptionsValueMap Represents the options values provided to run the action.
     * @param context Represents the action execution context.
     */
  private createRelease(actionOptionValueMap: ActionOptionValueMap,
                        context: GitHubReleaseActionContext) : Promise<any> {
    const scope = privateScope.get(this);
    const baseUrl: string = this.getBaseReleaseApiUrl(actionOptionValueMap);
    const relseaseUrl: string = `${baseUrl}?access_token=` +
                                `${actionOptionValueMap.token}`;
    const releaseData: any = {
      tag_name:  scope.textTemplateService.parse(actionOptionValueMap.tag),
      target_commitish: scope.textTemplateService.parse(actionOptionValueMap.target),
      name: scope.textTemplateService.parse(actionOptionValueMap.name),
      body: scope.textTemplateService.parse(actionOptionValueMap.description),
      draft: actionOptionValueMap.draft,
      prerelease: actionOptionValueMap.pre,
    };

    return axios.post(relseaseUrl, releaseData).then((response) => {
      context.releaseId = response.data.id;
      context.releaseUploadURL = response.data.upload_url;
    }).catch((error) => {
      throw new Error(error.response ? 
                      JSON.stringify(error.response.data, null, 2) : 
                     `Error requesting ${baseUrl} ${error.message}`);
    });
  
  }

    /**
     * Upload and assent to an github release.
     * @param releaseUploadUrl Represents the release upload url.
     * @param stream Represent the data to be upoaded (File Stream)
     * @param headers Represets the request headers.
     */
  private uploadAsset(releaseUploadUrl: string,
                      stream: fs.ReadStream,
                      headers: any) : Promise<any> {
    return axios.post(releaseUploadUrl, stream, { 
      headers,
    }).catch((error) => { 
      throw new Error(error.response ? 
                      JSON.stringify(error.response.data, null, 2) : 
                     `Error requesting ${releaseUploadUrl} ${error.message}`); 
    });
  }

    /**
     * Get the base release url portion of Git Hup API base on the provided action option value map.
     * @param actionOptionsValueMap Represents the options values provided to run the action.
     * @returns The base release url portion of the Git Hup API
     */
  private getBaseReleaseApiUrl(actionOptionValueMap: ActionOptionValueMap): string {
    return `${actionOptionValueMap.secure ? 'https' : 'http'}://${actionOptionValueMap.host}` +
           `/repos/${actionOptionValueMap.owner}/${actionOptionValueMap.repository}/releases`;
  }    

    /**
     * Returns a normalized resolved paths based on the provided assets paths.
     * @param assets Represents the assets that will be upload to the release.
     * @returns A normalized resolved paths array.
     */
  private getNormalizedAssetsPaths(assets: string | string[]): string[] {
 
    const unormalizedAssets: string[] = typeof assets === 'string' ? [assets] : assets;
    const normalizedAssets: string[] = [];
    const unexistingAssets: string[] = [];

    unormalizedAssets.forEach((unresolvedAsset) => {
      const resolvedAsset = path.resolve(unresolvedAsset);

      if (!fs.existsSync(resolvedAsset)) {
        unexistingAssets.push(resolvedAsset);
      } else {
        normalizedAssets.push(resolvedAsset);
      }
    });

    if (unexistingAssets.length) {
      throw new Error('The following assets can not be located: \n\n' + 
                       unexistingAssets.join('\n'));
    } else {
      return normalizedAssets;
    }
  }

  /**
   * Returns the action options.
   * @returns The action options.
   */
  private getOptions(): ActionOption[] {

    return[{
      key: 'token',
      description: 'Represents the git hub token to comunicate with the API',
      isRequired: true,
      isSecure: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'host',
      description: 'Represents the git hub host to comunicate with.',
      isRequired: true,
      type: ActionOptionTypes.text,
      defaultValue: 'api.github.com',
    },
    {
      key: 'secure',
      description: 'Represents a boolean value specifying if the communication with the host' + 
                    'must be secure.',
      isRequired: true,
      type: ActionOptionTypes.boolean,
      defaultValue: true,
    },
    {
      key: 'owner',
      description: 'Represents the owner name of the repository.',
      isRequired: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'repository',
      description: 'Represents the repository that will be released.',
      isRequired: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'tag',
      description: 'Represents the tag where the release will be based on.',
      isTemplated: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'target',
      description: 'Represents the target were the tag will be based on, if the tag already exist' +
                    'must not be provided.',
      isTemplated: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'name',
      description: 'Represents the release name.',
      isRequired: true,
      isTemplated: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'description',
      description: 'Represents the release description.',
      isTemplated: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'draft',
      description: 'Represents a boolean value specifying if the release is a draft.',
      defaultValue: false,
      type: ActionOptionTypes.boolean,
    },
    {
      key: 'pre',
      description: 'Represents a boolean value specifying if the release is a pre-release',
      defaultValue: false,
      type: ActionOptionTypes.boolean,
    },
    {
      key: 'asset',
      description: 'Represents a list of paths that represents the assets that will be uploaded.',
      type: ActionOptionTypes.list,
    }];        
  }    
}
