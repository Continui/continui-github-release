import { ActionOptionValueMap } from 'continui-action';
 /**
  * Represents a shares that store the action option value map of the execution.
  */
export interface ActionOptionValueMapSharer {
    /**
     * Store the action option value map to provide it when is requested.
     * @param actionOptionValueMap option value map Represents the action option value map.
     */
  sotoreActionOptionValueMap(actionOptionValueMap: ActionOptionValueMap);

    /**
     * Returns the stored action option value map.
     * @param the Stored action option value map.
     */
  getActionOptionValueMap(): ActionOptionValueMap;
}
