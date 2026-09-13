/**
* | output |
* | --- |
* | "Enter a valid email address." |
*
* @param {Intake_Error_Email_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_email_format: ((inputs?: Intake_Error_Email_FormatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Email_FormatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Email_FormatInputs = {};
