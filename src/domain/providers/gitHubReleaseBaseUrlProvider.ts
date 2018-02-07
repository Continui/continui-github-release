/**
 * Represents a provider that provides based url for git hub releases.
 */
export interface GitHubReleaseBaseUrlProvider {
    /**
     * Returns a base url for the git hub api.
     * @returns A git hub api base url.
     */
  gitHubApiBaseUrl(): Promise<string>;

    /**
     * Returns a base url for the git hub uploads.
     * @returns A git hub uploads base url.
     */
  gitHubUploadsBaseUrl(): Promise<string>;
}
