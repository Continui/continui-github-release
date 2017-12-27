import { StepActivationDefinition, StepActivationReference, Step } from 'continui-step';
import { GitHubReleaseStep } from './gitHubReleaseStep';

export class GitHubReleaseStepDefinition implements StepActivationDefinition {
  public get identifier(): string { return 'githubre'; }
  public get step(): Function { return GitHubReleaseStep; }
  public get activationReferences(): StepActivationReference[] { return []; }
}
