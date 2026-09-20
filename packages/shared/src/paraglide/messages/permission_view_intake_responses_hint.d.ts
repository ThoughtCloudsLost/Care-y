/**
* | output |
* | --- |
* | "Granting this decides who receives decryption keys when a form is submitted. Revoking it later does not take back keys already issued." |
*
* @param {Permission_View_Intake_Responses_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_intake_responses_hint: ((inputs?: Permission_View_Intake_Responses_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_Intake_Responses_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_Intake_Responses_HintInputs = {};
