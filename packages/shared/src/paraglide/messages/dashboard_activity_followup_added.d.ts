/**
* | output |
* | --- |
* | "New message" |
*
* @param {Dashboard_Activity_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_followup_added: ((inputs?: Dashboard_Activity_Followup_AddedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Followup_AddedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Followup_AddedInputs = {};
