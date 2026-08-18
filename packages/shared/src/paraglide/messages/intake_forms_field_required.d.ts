/**
* | output |
* | --- |
* | "required" |
*
* @param {Intake_Forms_Field_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_required: ((inputs?: Intake_Forms_Field_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_RequiredInputs = {};
