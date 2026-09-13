/**
* | output |
* | --- |
* | "Choose one option" |
*
* @param {Intake_Forms_Field_Type_Select_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_select_desc: ((inputs?: Intake_Forms_Field_Type_Select_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Type_Select_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Type_Select_DescInputs = {};
