/**
* | output |
* | --- |
* | "Grants decrypt capability for intake submissions across all queues. High-trust permission." |
*
* @param {Permission_View_Intake_Responses_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_intake_responses_hint: ((inputs?: Permission_View_Intake_Responses_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_Intake_Responses_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_Intake_Responses_HintInputs = {};
