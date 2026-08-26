/**
* | output |
* | --- |
* | "Value must be at most {max}." |
*
* @param {Intake_Error_Number_MaxInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_number_max: ((inputs: Intake_Error_Number_MaxInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Number_MaxInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Number_MaxInputs = {
    max: NonNullable<unknown>;
};
