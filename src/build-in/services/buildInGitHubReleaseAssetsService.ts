import { GitHubReleaseAssetsService } from '../../domain/services/gitHubReleaseAssetsService';
import { ActionOptionValueMapSharer } from '../../domain/sharers/actionOptionValueMapSharer';
import { GitHubReleaseBaseUrlProvider } from '../../domain/providers/gitHubReleaseBaseUrlProvider';

import axios from 'axios';

import * as fs from 'fs';
import * as path from 'path';

const privateScope: WeakMap<BuildInGitHubReleaseAssetsService, {
  actionOptionValueMapSharer: ActionOptionValueMapSharer,
  gitHubReleaseBaseUrlProvider: GitHubReleaseBaseUrlProvider,
}> = new WeakMap();

/**
 * Represents a service that manage git hub release assets.
 */
export class BuildInGitHubReleaseAssetsService implements GitHubReleaseAssetsService {

  constructor(actionOptionValueMapSharer: ActionOptionValueMapSharer,
              gitHubReleaseBaseUrlProvider: GitHubReleaseBaseUrlProvider) {

    privateScope.set(this, {
      actionOptionValueMapSharer,
      gitHubReleaseBaseUrlProvider,
    });
  }

    /**
     * Uploads the provided file into the release with the provided relese id.
     * @param files Represents the file(s) to be upload.
     * @param releaseId Represents the release id.
     */
  public async uploadAssetIntoRelease(files: string | string[], releaseId: number): Promise<void> {

    const assets: string[] = this.getNormalizedAssetsPaths(files);

    if (assets.length) {
      await Promise.all(
                assets.map((asset) => {
                  return this.uploadAsset(asset, releaseId);
                }),
            );
    }
  }


    /**
     * Upload and assent to an github release.
     * @param releaseUploadUrl Represents the release upload url.
     * @param stream Represent the data to be upoaded (File Stream)
     * @param headers Represets the request headers.
     */
  private async uploadAsset(asset: string, releaseId: number):
        Promise<any> {
    const scope = privateScope.get(this);
    const actionOptionValueMap = scope.actionOptionValueMapSharer.getActionOptionValueMap();
    const baseUrl: string = await scope.gitHubReleaseBaseUrlProvider.gitHubUploadsBaseUrl();        
    const uploadUrl: string = `${baseUrl}/${releaseId}/assets?name=${path.basename(asset)}`; 
    const fileStats: fs.Stats = fs.statSync(asset);

    try {
      await axios.post(uploadUrl, fs.createReadStream(asset), {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Content-Length': fileStats.size,
          Authorization: 'token ' + actionOptionValueMap.token,
        },
      });
    } catch (error) {
      throw new Error(error.response ?
                JSON.stringify(error.response.data, null, 2) :
                `Error requesting ${uploadUrl} ${error.message}`);
    }

  }


    /**
     * Returns a normalized resolved paths based on the provided assets paths.
     * @param assets Represents the assets that will be upload to the release.
     * @returns A normalized resolved paths array.
     */
  private getNormalizedAssetsPaths(assets: string | string[]): string[] {

    if (!assets) {
      return [];
    }

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

}
