/**
* | output |
* | --- |
* | "Notify managers" |
*
* @param {Escalation_Action_Notify_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_action_notify_managers: ((inputs?: Escalation_Action_Notify_ManagersInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Action_Notify_ManagersInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Action_Notify_ManagersInputs = {};
