/**
* | output |
* | --- |
* | "Notify managers" |
*
* @param {Escalation_Action_Notify_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_action_notify_managers: ((inputs?: Escalation_Action_Notify_ManagersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Action_Notify_ManagersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Action_Notify_ManagersInputs = {};
