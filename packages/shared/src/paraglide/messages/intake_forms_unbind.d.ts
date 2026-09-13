/**
* | output |
* | --- |
* | "Unbind" |
*
* @param {Intake_Forms_UnbindInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_unbind: ((inputs?: Intake_Forms_UnbindInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_UnbindInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_UnbindInputs = {};
