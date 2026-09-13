/**
* | output |
* | --- |
* | "Save it if you want to follow up by phone." |
*
* @param {Intake_Reference_SaveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_reference_save: ((inputs?: Intake_Reference_SaveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Reference_SaveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Reference_SaveInputs = {};
