import { StepActivationDefinition, StepActivationReference, Step } from 'continui-step';
import { GitHubReleaseStep } from './gitHubReleaseStep';

/**
 * Represents a step activation definition for GitHub releases.
 */
export class GitHubReleaseStepDefinition implements StepActivationDefinition {
  /**
   * Represents the step identifier.
   */
  public get identifier(): string { return 'github-release'; }

  /**
   * Represents the step funtion that will be available for continui for instantiation.
   */
  public get step(): Function { return GitHubReleaseStep; }

   /**
   * Represents the step activation references, also called dependency references.
   */
  public get activationReferences(): StepActivationReference[] { return []; }
}
