import { ActionOptionValueMapSharer } from '../../domain/sharers/actionOptionValueMapSharer';
import { ActionOptionValueMap } from 'continui-action';

const privateScope: WeakMap<BuildInActionOptionValueMapSharer, {
  actionOptionValueMap: ActionOptionValueMap,
}> = new WeakMap();

/**
 * Represents a shares that store the action option value map of the execution.
 */
export class BuildInActionOptionValueMapSharer implements ActionOptionValueMapSharer {

  constructor() {
    privateScope.set(this, {
      actionOptionValueMap: undefined,
    });
  }

    /**
     * Store the action option value map to provide it when is requested.
     * @param actionOptionValueMap option value map Represents the action option value map.
     */
  public sotoreActionOptionValueMap(actionOptionValueMap: ActionOptionValueMap): void {
    privateScope.get(this).actionOptionValueMap = actionOptionValueMap;
  }

    /**
     * Returns the stored action option value map.
     * @param the Stored action option value map.
     */
  public getActionOptionValueMap(): ActionOptionValueMap {
    const actionOptionValueMap = privateScope.get(this).actionOptionValueMap;

    if (!actionOptionValueMap) {
      throw new Error('There is not action option value map to share.');
    }

    return actionOptionValueMap;
  }
}
