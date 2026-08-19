/**
* | output |
* | --- |
* | "Shown at /intake when no specific form link is used." |
*
* @param {Intake_Forms_Default_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_default_hint: ((inputs?: Intake_Forms_Default_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Default_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Default_HintInputs = {};
