import { GitHubReleaseBaseUrlProvider } from '../../domain/providers/gitHubReleaseBaseUrlProvider';
import { ActionOptionValueMapSharer } from '../../domain/sharers/actionOptionValueMapSharer';

const privateScope: WeakMap<BuildInGitHubReleaseBaseUrlProvider, {
  actionOptionValueMapSharer: ActionOptionValueMapSharer,
}> = new WeakMap();

/**
 * Represents a provider that provides based url for git hub releases.
 */
export class BuildInGitHubReleaseBaseUrlProvider implements GitHubReleaseBaseUrlProvider {

  constructor(actionOptionValueMapSharer: ActionOptionValueMapSharer) {
    privateScope.set(this, {
      actionOptionValueMapSharer,
    });
  }

    /**
     * Returns a base url for the git hub api.
     * @returns A git hub api base url.
     */
  public async gitHubApiBaseUrl(): Promise<string> {
    const actionOptionValueMap = 
        privateScope.get(this).actionOptionValueMapSharer.getActionOptionValueMap();

    return this.getBaseUrl(actionOptionValueMap.apiHost);
  }
    

    /**
     * Returns a base url for the git hub uploads.
     * @returns A git hub uploads base url.
     */
  public async gitHubUploadsBaseUrl(): Promise<string> {
    const actionOptionValueMap = 
        privateScope.get(this).actionOptionValueMapSharer.getActionOptionValueMap();

    return this.getBaseUrl(actionOptionValueMap.uploadHost);
  }

    /**
     * Return a base url for git hub with the provided host.
     * @param host Resents the base url host
     * @returns A git hub base url.
     */
  private getBaseUrl(host): string {
    const actionOptionValueMap = 
        privateScope.get(this).actionOptionValueMapSharer.getActionOptionValueMap();

    if (!host) {
      throw new Error('Must provided a valid host');
    }

    if (!actionOptionValueMap.owner) {
      throw new Error('Must provided an api repository ower');
    }

    if (!actionOptionValueMap.repository) {
      throw new Error('Must provided an api repository name');
    }

    let baseUrl: string = '';
    baseUrl += actionOptionValueMap.secure ? 'https' : 'http';
    baseUrl += `://${host}/`;
    baseUrl += 'repos/';
    baseUrl += `${actionOptionValueMap.owner}/`;
    baseUrl += `${actionOptionValueMap.repository}/`;
    baseUrl += 'releases';

    return baseUrl;
  }
}
