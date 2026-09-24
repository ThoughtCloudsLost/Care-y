/**
* | output |
* | --- |
* | "Text area" |
*
* @param {Intake_Forms_Field_Type_TextareaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_textarea: ((inputs?: Intake_Forms_Field_Type_TextareaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Type_TextareaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Type_TextareaInputs = {};
