import { GitHubReleaseData } from '../../domain/models/gitHubReleaseData';
import { GitHubReleaseService } from '../../domain/services/gitHubReleaseService';
import { GitHubReleaseBaseUrlProvider } from '../../domain/providers/gitHubReleaseBaseUrlProvider';
import { ActionOptionValueMapSharer } from '../../domain/sharers/actionOptionValueMapSharer';

import axios from 'axios';

const privateScope: WeakMap<BuildInGitHubReleaseService, {
  actionOptionValueMapSharer: ActionOptionValueMapSharer,
  gitHubReleaseBaseUrlProvider: GitHubReleaseBaseUrlProvider,
}> = new WeakMap();

/**
 * Represents service to managa git hub releases.
 */
export class BuildInGitHubReleaseService implements GitHubReleaseService {

  constructor(actionOptionValueMapSharer: ActionOptionValueMapSharer,
              gitHubReleaseBaseUrlProvider: GitHubReleaseBaseUrlProvider) {

    privateScope.set(this, {
      actionOptionValueMapSharer,
      gitHubReleaseBaseUrlProvider,
    });
  }

    /**
     * Returns a release id as a result of a release creation.
     * @param gitHubReleaseData Represents the data for the release.
     * @returns A release id.
     */
  public async createRelease(gitHubReleaseData: GitHubReleaseData): Promise<number> {
    const scope = privateScope.get(this);
    const actionOptionValueMap = scope.actionOptionValueMapSharer.getActionOptionValueMap();
    const baseUrl: string = await scope.gitHubReleaseBaseUrlProvider.gitHubApiBaseUrl();
    const relseaseUrl: string = `${baseUrl}?access_token=` + `${actionOptionValueMap.token}`;

    try {
      const axiosResponse = await axios.post(relseaseUrl, gitHubReleaseData);
      return axiosResponse.data.id;
    } catch (error) {
      throw new Error(error.response ?
                JSON.stringify(error.response.data, null, 2) :
                `Error requesting ${baseUrl} ${error.message}`);
    }
  }

    /**
     * Remove the release with the provided release id.
     * @param releaseId Represens the id of the release to be removed.
     */
  public async removeRelease(releaseId: number): Promise<void> {
    const scope = privateScope.get(this);
    const actionOptionValueMap = scope.actionOptionValueMapSharer.getActionOptionValueMap();
    const baseUrl: string = await scope.gitHubReleaseBaseUrlProvider.gitHubApiBaseUrl();

    try {
      await axios.delete(
                `${baseUrl}/${releaseId}`, {
                  headers: {
                    Authorization: 'token ' + actionOptionValueMap.token,
                  },
                },
            );
    } catch (error) {
      throw new Error(error.response ?
                JSON.stringify(error.response.data, null, 2) :
                `Error requesting ${baseUrl} ${error.message}`);
    }
  }
}
