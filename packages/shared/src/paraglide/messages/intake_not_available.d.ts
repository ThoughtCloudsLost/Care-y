/**
* | output |
* | --- |
* | "This form is not available. If you need help, contact the organization directly." |
*
* @param {Intake_Not_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_not_available: ((inputs?: Intake_Not_AvailableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Not_AvailableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Not_AvailableInputs = {};
