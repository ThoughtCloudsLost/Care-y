/**
* | output |
* | --- |
* | "Used by" |
*
* @param {Intake_Forms_Used_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_used_by: ((inputs?: Intake_Forms_Used_ByInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Used_ByInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Used_ByInputs = {};
