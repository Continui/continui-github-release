import { ActionActivationDefinition, ActionActivationReference, Action } from 'continui-action';
import { GitHubReleaseAction } from './gitHubReleaseAction';

/**
 * Represents a action activation definition for GitHub releases.
 */
export class GitHubReleaseActionDefinition implements ActionActivationDefinition {
  /**
   * Represents the action identifier.
   */
  public get identifier(): string { return 'github-release'; }

  /**
   * Represents the action funtion that will be available for continui for instantiation.
   */
  public get action(): Function { return GitHubReleaseAction; }

   /**
   * Represents the action activation references, also called dependency references.
   */
  public get activationReferences(): ActionActivationReference[] { return []; }
}
