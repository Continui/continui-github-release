
import { Step } from "../../step"
import { StepOption } from "../../stepOption";
import { StepOptionValueMap } from "../../types";
import { GitHubReleaseContext } from "./gitHubReleaseContext"
import { TextTemplateService } from "../../services/textTemplateService";
import { Stats, ReadStream } from "fs";

import * as stepOptionType from "../../stepOptionType"
import * as fs from 'fs'
import * as path from 'path'

import axios from 'axios'

let privateScope = new WeakMap<GitHubReleaseStep, {
    textTemplateService: TextTemplateService
}>()

/**
 * Represents a git hub release step that can create well defined releases on Git Hub.
 */
export class GitHubReleaseStep implements Step<GitHubReleaseContext> {

    constructor(textTemplateService: TextTemplateService) {
        privateScope.set(this, {
            textTemplateService: textTemplateService
        })
    }

    /**
     * Get the step identifier.
     */
    public get identifier(): string { return 'githubre' }
    
    /**
     * Get the step name.
     */
    public get name(): string { return 'Git Hub Release' }

    /**
     * Get the step description.
     */
    public get description(): string { return 'Represents a git hub release step that can create well defined releases on Git Hub.' }

    /**
     * Represents the step otions used to execute the step.
     */
    public get options(): StepOption[] { return this.getOptions() }

    /**
     * Creates a restoration point based on the step to rollback the changes in case that the pipe flow breaks.
     * @param stepOptionsValueMap Represents the options values provided to run the step.
     * @param context Represents the step execution context.
     */
    public createsRestaurationPoint(stepOptionValueMap: StepOptionValueMap, context: GitHubReleaseContext): void | Promise<void> | IterableIterator<any> {
       // NOTHING to do here.
    }
    
    /**
     * Execute the step base on the given options and context.
     * @param stepOptionsValueMap Represents the options values provided to run the step.
     * @param context Represents the step execution context.
     */
    public* execute(stepOptionValueMap: StepOptionValueMap, context: GitHubReleaseContext): void | Promise<void> | IterableIterator<any> {

        let assets:string[] = this.getNormalizedAssetsPaths(stepOptionValueMap.asset || [])

        yield this.createRelease(stepOptionValueMap, context)        

        yield assets.map(asset => {
            let fileStats: Stats = fs.statSync(asset);
            let uploadUrl: string = context.uploadURL.replace('{?name,label}', '?name=' + path.basename(asset))

            return this.uploadAsset(uploadUrl, fs.createReadStream(asset) ,{
                'Content-Type': 'multipart/form-data',
                'Content-Length': fileStats.size,
                'Authorization': 'token ' + stepOptionValueMap.token
            })
        })               
    }    
    
    /**
     * Restore the step base on the given options and context.
     * @param context Represents the step execution context.
     */
    public* restore(stepOptionValueMap: StepOptionValueMap, context: GitHubReleaseContext): void | Promise<void> | IterableIterator<any> {
        if (context.id) {           
            yield axios.delete(`${this.getBaseReleaseApiUrl(stepOptionValueMap)}/` + context.id, {
                headers: {
                    'Authorization': 'token ' + stepOptionValueMap.token
                }
            })              
        }
    }

    /**
     * Creates and return an new context bases on the provided options.
     * @param stepOptionsValueMap Represents the options values provided to run the step.
     * @returns A new execution context bases on the provided options.
     */
    public createsNewContextFromOptionsMap(stepOptionsValueMap: StepOptionValueMap): GitHubReleaseContext {
        return  new GitHubReleaseContext();
    }

    /**
     * Creates a Git Hub release bases on the step options value.
     * @param stepOptionsValueMap Represents the options values provided to run the step.
     * @param context Represents the step execution context.
     */
    private createRelease(stepOptionValueMap: StepOptionValueMap, context: GitHubReleaseContext) : Promise<any> {
        let scope = privateScope.get(this);

        return axios.post(`${this.getBaseReleaseApiUrl(stepOptionValueMap)}?access_token=${stepOptionValueMap.token}`, {
            tag_name:  scope.textTemplateService.tranform(stepOptionValueMap.tag),
            target_commitish: scope.textTemplateService.tranform(stepOptionValueMap.target),
            name: scope.textTemplateService.tranform(stepOptionValueMap.name),
            body: scope.textTemplateService.tranform(stepOptionValueMap.description),
            draft: stepOptionValueMap.draft,
            prerelease: stepOptionValueMap.pre
        }).then(response => {
            context.id = response.data.id
            context.uploadURL = response.data.upload_url
        }).catch(error => { 
            throw (error.response.data || 'undefined error creating release')
        })
    }

    /**
     * Upload and assent to an github release.
     * @param releaseUploadUrl Represents the release upload url.
     * @param stream Represent the data to be upoaded (File Stream)
     * @param headers Represets the request headers.
     */
    private uploadAsset(releaseUploadUrl: string, stream: ReadStream, headers: any) : Promise<any> {
        return axios.post(releaseUploadUrl, stream, { 
            headers: headers
        })
        .catch(error => { 
            throw (error.response.data || 'undefined error uploaing release asset') 
        })
    }

    /**
     * Get the base release url portion of the Git Hup API base on the provided step option value map.
     * @param stepOptionsValueMap Represents the options values provided to run the step.
     * @returns The base release url portion of the Git Hup API
     */
    private getBaseReleaseApiUrl(stepOptionValueMap: StepOptionValueMap): string {
        return `${stepOptionValueMap.secure ? 'https' : 'http'}://${stepOptionValueMap.host}/repos/${stepOptionValueMap.owner}/${stepOptionValueMap.repository}/releases`
    }

    /**
     * Returns the step options.
     * @returns The step options.
     */
    private getOptions(): StepOption[] {

        return[{
            key: 'token',
            description: 'Represents the git hub token to comunicate with the API',
            isRequired: true,
            isSecure: true,
            type: stepOptionType.text
        },
        {
            key: 'host',
            description: 'Represents the git hub host to comunicate with.',
            isRequired: true,
            type: stepOptionType.text,
            defaultValue: 'api.github.com'
        },
        {
            key: 'secure',
            description: 'Represents a boolean value specifying if the communication with the host must be secure.',
            isRequired: true,
            type: stepOptionType.boolean,
            defaultValue: true
        },
        {
            key: 'owner',
            description: 'Represents the owner name of the repository.',
            isRequired: true,
            type: stepOptionType.text
        },
        {
            key: 'repository',
            description: 'Represents the repository that will be released.',
            isRequired: true,
            type: stepOptionType.text
        },
        {
            key: 'tag',
            description: 'Represents the tag where the release will be based on.',
            isTemplated: true,
            type: stepOptionType.text
        },
        {
            key: 'target',
            description: 'Represents the target were the tag will be based on, if the tag already exist must not be provided.',
            isTemplated: true,
            type: stepOptionType.text
        },
        {
            key: 'name',
            description: 'Represents the release name.',
            isRequired: true,
            isTemplated: true,
            type: stepOptionType.text
        },
        {
            key: 'description',
            description: 'Represents the release description.',
            isTemplated: true,
            type: stepOptionType.text
        },
        {
            key: 'draft',
            description: 'Represents a boolean value specifying if the release is a draft.',
            defaultValue: false,
            type: stepOptionType.boolean
        },
        {
            key: 'pre',
            description: 'Represents a boolean value specifying if the release is a pre-release',
            defaultValue: false,
            type: stepOptionType.boolean
        },
        {
            key: 'asset',
            description: 'Represents a list of paths that represents the assets that will be uploaded.',
            type: stepOptionType.list
        }];        
    }    

    /**
     * Returns a normalized resolved paths based on the provided assets paths.
     * @param assets Represents the assets that will be upload to the release.
     * @returns A normalized resolved paths array.
     */
    private getNormalizedAssetsPaths(assets: string | string[]): string[] {
        if (typeof assets == 'string') {
            assets = [assets];
        }

        let normalizedAssets: string[] = []
        let unexistingAssets: string[] = []

        assets.forEach(asset => {
            asset = path.resolve(asset)

            if (!fs.existsSync(asset)) {
                unexistingAssets.push(asset)
            } else {
                normalizedAssets.push(asset)
            }
        });

        if (unexistingAssets.length) {
            throw new Error('The following assets can not be located: \n\n' + unexistingAssets.join('\n'))
        } else {
            return normalizedAssets;
        }
    }
}