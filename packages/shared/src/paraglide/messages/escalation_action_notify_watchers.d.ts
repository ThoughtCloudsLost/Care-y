/**
* | output |
* | --- |
* | "Notify queue watchers" |
*
* @param {Escalation_Action_Notify_WatchersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_action_notify_watchers: ((inputs?: Escalation_Action_Notify_WatchersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Action_Notify_WatchersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Action_Notify_WatchersInputs = {};
