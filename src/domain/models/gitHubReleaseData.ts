
/**
 * Represents a git hub release data.
 */
export interface GitHubReleaseData {
    /**
     * Get or set the tag name.
     */
  tag_name: string;

    /**
     * Get or ser 
     */
  target_commitish: string;
    
    /**
     * Get or set  the name of the release.
     */
  name: string;

    /**
     * Get or set the tag descrition.
     */
  body: string;

    /**
     * Get or set a boolean value specifying if the release is a draft.
     */
  draft: boolean;

    /**
     * Get or set a boolean value specifying if the release is a pre-release.
     */
  prerelease: boolean;
}
