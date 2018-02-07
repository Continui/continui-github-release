
import { Action, ActionOption, ActionOptionTypes, ActionOptionValueMap } from 'continui-action';
import { GitHubReleaseActionContext } from './gitHubReleaseActionContext';
import { TextTemplateService } from 'continui-services';
import { ActionOptionValueMapSharer } from './domain/sharers/actionOptionValueMapSharer';
import { GitHubReleaseService } from './domain/services/gitHubReleaseService';
import { GitHubReleaseAssetsService } from './domain/services/gitHubReleaseAssetsService';

const privateScope = new WeakMap<GitHubReleaseAction, {
  textTemplateService: TextTemplateService,
  gitHubReleaseService: GitHubReleaseService,
  gitHubReleaseAssetsService: GitHubReleaseAssetsService,
  actionOptionValueMapSharer: ActionOptionValueMapSharer,
}>();

/**
 * Represents a git hub release action that can create well defined releases on Git Hub.
 */
export class GitHubReleaseAction extends Action<GitHubReleaseActionContext> {

  constructor(textTemplateService: any,
              gitHubReleaseService: GitHubReleaseService,
              gitHubReleaseAssetsService: GitHubReleaseAssetsService,
              actionOptionValueMapSharer: ActionOptionValueMapSharer) {
    super();

    privateScope.set(this, {
      textTemplateService,
      gitHubReleaseService,
      gitHubReleaseAssetsService,
      actionOptionValueMapSharer,
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
  public * execute(actionOptionValueMap: ActionOptionValueMap,
                   context: GitHubReleaseActionContext)
    : void | Promise<void> | IterableIterator<any> {

    const scope = privateScope.get(this);
    
    scope.actionOptionValueMapSharer.storeActionOptionValueMap(actionOptionValueMap);
    
    context.releaseId = yield scope.gitHubReleaseService.createRelease({
      tag_name: scope.textTemplateService.parse(actionOptionValueMap.tag),
      target_commitish: scope.textTemplateService.parse(actionOptionValueMap.target),
      name: scope.textTemplateService.parse(actionOptionValueMap.name),
      body: scope.textTemplateService.parse(actionOptionValueMap.description),
      draft: actionOptionValueMap.draft,
      prerelease: actionOptionValueMap.pre,
    });

    yield scope.gitHubReleaseAssetsService
               .uploadAssetIntoRelease(actionOptionValueMap.asset, context.releaseId);
  }

  /**
   * Restore the action base on the given options and context.
   * @param context Represents the action execution context.
   */
  public * restore(actionOptionValueMap: ActionOptionValueMap,
                   context: GitHubReleaseActionContext)
    : void | Promise<void> | IterableIterator<any> {
    if (context.releaseId) {
      privateScope.get(this).gitHubReleaseService.removeRelease(context.releaseId);
    }
  }

  /**
   * Creates and return an new context bases on the provided options.
   * @param actionOptionsValueMap Represents the options values provided to run the action.
   * @returns A new execution context bases on the provided options.
   */
  public createsContextFromOptionsMap(actionOptionsValueMap: ActionOptionValueMap)
    : GitHubReleaseActionContext {
    return {};
  }

  /**
   * Returns the action options.
   * @returns The action options.
   */
  private getOptions(): ActionOption[] {

    return [{
      key: 'token',
      description: 'Represents the git hub token to comunicate with the API',
      isRequired: true,
      isSecure: true,
      type: ActionOptionTypes.text,
    },
    {
      key: 'api-host',
      description: 'Represents the git hub api host to comunicate with.',
      isRequired: true,
      type: ActionOptionTypes.text,
      defaultValue: 'api.github.com',
    },
    {
      key: 'upload-host',
      description: 'Represents the git hub uploads host to comunicate with.',
      isRequired: true,
      type: ActionOptionTypes.text,
      defaultValue: 'uploads.github.com',
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
