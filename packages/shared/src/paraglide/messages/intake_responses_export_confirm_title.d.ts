/**
* | output |
* | --- |
* | "Export decrypted responses?" |
*
* @param {Intake_Responses_Export_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_title: ((inputs?: Intake_Responses_Export_Confirm_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Export_Confirm_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Export_Confirm_TitleInputs = {};
