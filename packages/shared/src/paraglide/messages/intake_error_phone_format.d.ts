/**
* | output |
* | --- |
* | "Enter a phone number like +1 555 000 1234." |
*
* @param {Intake_Error_Phone_FormatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_phone_format: ((inputs?: Intake_Error_Phone_FormatInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Phone_FormatInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Phone_FormatInputs = {};
