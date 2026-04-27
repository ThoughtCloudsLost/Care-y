/**
* | output |
* | --- |
* | "{count} days" |
*
* @param {Admin_Queue_Escalation_DaysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_escalation_days: ((inputs: Admin_Queue_Escalation_DaysInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Escalation_DaysInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Escalation_DaysInputs = {
    count: NonNullable<unknown>;
};
