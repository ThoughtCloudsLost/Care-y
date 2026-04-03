/**
* | output |
* | --- |
* | "New message" |
*
* @param {Dashboard_Activity_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_followup_added: ((inputs?: Dashboard_Activity_Followup_AddedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Followup_AddedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Followup_AddedInputs = {};
