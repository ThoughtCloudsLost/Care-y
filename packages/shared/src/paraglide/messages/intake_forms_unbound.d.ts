/**
* | output |
* | --- |
* | "Form unbound from queue" |
*
* @param {Intake_Forms_UnboundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_unbound: ((inputs?: Intake_Forms_UnboundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_UnboundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_UnboundInputs = {};
