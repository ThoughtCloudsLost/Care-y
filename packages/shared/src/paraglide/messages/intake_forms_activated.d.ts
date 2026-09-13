/**
* | output |
* | --- |
* | "Form activated" |
*
* @param {Intake_Forms_ActivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_activated: ((inputs?: Intake_Forms_ActivatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_ActivatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_ActivatedInputs = {};
