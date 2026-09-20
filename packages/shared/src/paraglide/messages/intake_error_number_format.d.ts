/**
* | output |
* | --- |
* | "Enter a valid number." |
*
* @param {Intake_Error_Number_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_number_format: ((inputs?: Intake_Error_Number_FormatInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Number_FormatInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Number_FormatInputs = {};
