/**
* | output |
* | --- |
* | "Text block" |
*
* @param {Intake_Forms_Field_Type_Rich_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_rich_text: ((inputs?: Intake_Forms_Field_Type_Rich_TextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Type_Rich_TextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Type_Rich_TextInputs = {};
