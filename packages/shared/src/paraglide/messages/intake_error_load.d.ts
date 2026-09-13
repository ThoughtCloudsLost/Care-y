/**
* | output |
* | --- |
* | "The form couldn't load. Check your connection and try again." |
*
* @param {Intake_Error_LoadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_load: ((inputs?: Intake_Error_LoadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_LoadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_LoadInputs = {};
