/**
* | output |
* | --- |
* | "Enter a valid date." |
*
* @param {Intake_Error_Date_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_date_format: ((inputs?: Intake_Error_Date_FormatInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Date_FormatInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Date_FormatInputs = {};
