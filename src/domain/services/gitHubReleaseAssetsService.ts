/**
 * Represents a service that manage git hub release assets.
 */
export interface GitHubReleaseAssetsService {
    /**
     * Uploads the provided file into the release with the provided relese id.
     * @param files Represents the file(s) to be upload.
     * @param releaseId Represents the release id.
     */
  uploadAssetIntoRelease(files: string | string[], releaseId: number): Promise<void>;
}
