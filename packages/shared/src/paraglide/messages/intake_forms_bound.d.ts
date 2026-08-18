/**
* | output |
* | --- |
* | "Form bound to queue" |
*
* @param {Intake_Forms_BoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_bound: ((inputs?: Intake_Forms_BoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_BoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_BoundInputs = {};
