/**
* | output |
* | --- |
* | "Value must be at least {min}." |
*
* @param {Intake_Error_Number_MinInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_number_min: ((inputs: Intake_Error_Number_MinInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Number_MinInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Number_MinInputs = {
    min: NonNullable<unknown>;
};
