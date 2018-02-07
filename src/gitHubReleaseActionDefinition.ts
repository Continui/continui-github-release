import { ActionActivationDefinition, Action, ActionActivationContext } from 'continui-action';
import { GitHubReleaseAction } from './gitHubReleaseAction';
import {
  BuildInActionOptionValueMapSharer,
} from './build-in/sharers/buildInActionOptionValueMapSharer';
import {
  BuildInGitHubReleaseService,
} from './build-in/services/buildInGitHubReleaseService';
import {
  BuildInGitHubReleaseAssetsService,
} from './build-in/services/buildInGitHubReleaseAssetsService';
import {
  BuildInGitHubReleaseBaseUrlProvider,
} from './build-in/providers/buildInGitHubReleaseBaseUrlProvider';

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
   * Register the stp dependencies into the provided containerized kernel.
   * @param ActionActivationContext Reresents the activation context.
   */
  public registerDependencies(actionActivationContext: ActionActivationContext): void {

    actionActivationContext.containerizedKernel
                           .bind('gitHubReleaseAssetsService')
                           .to(BuildInGitHubReleaseAssetsService);

    actionActivationContext.containerizedKernel
                           .bind('gitHubReleaseService')
                           .to(BuildInGitHubReleaseService);

    actionActivationContext.containerizedKernel
                           .bind('gitHubReleaseBaseUrlBuilder')
                           .to(BuildInGitHubReleaseBaseUrlProvider)
                           .inPerCallMode();

    actionActivationContext.containerizedKernel
                           .bind('actionOptionValueMapSharer')
                           .to(BuildInActionOptionValueMapSharer)
                           .inPerCallMode()
                           .whenInjectedExactlyIntoTypes(
                             BuildInGitHubReleaseService,
                             BuildInGitHubReleaseBaseUrlProvider,
                             BuildInGitHubReleaseAssetsService,
                            );

  }

}
