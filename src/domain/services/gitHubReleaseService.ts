import { GitHubReleaseData } from '../models/gitHubReleaseData';

/**
 * Represents service to managa git hub releases.
 */
export interface GitHubReleaseService {

    /**
     * Returns a release id as a result of a release creation.
     * @param gitHubReleaseData Represents the data for the release.
     * @returns A release id.
     */
  createRelease(gitHubReleaseData: GitHubReleaseData): Promise<number>;

    /**
     * Remove the release with the provided release id.
     * @param releaseId Represens the id of the release to be removed.
     */
  removeRelease(releaseId: number): Promise<void>;
}
