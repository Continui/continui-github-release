/**
 * Represents the release context that used to handle the process information.
 */
export class GitHubReleaseActionContext {
  /**
   * Represents the GitHub release id.
   */
  public releaseId: number;

  /**
   * Represents the GitHub release upload url.
   */
  public releaseUploadURL: string;

  /**
   * Represents the a boolean value specifying if the assets has been uploaded into the release.
   */
  public assetsHasBeenUpload: boolean;    
}
