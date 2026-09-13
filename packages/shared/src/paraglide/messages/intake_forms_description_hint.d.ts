/**
* | output |
* | --- |
* | "Shown on the public form page." |
*
* @param {Intake_Forms_Description_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_description_hint: ((inputs?: Intake_Forms_Description_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Description_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Description_HintInputs = {};
