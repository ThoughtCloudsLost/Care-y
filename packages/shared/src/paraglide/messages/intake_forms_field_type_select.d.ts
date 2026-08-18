/**
* | output |
* | --- |
* | "Dropdown" |
*
* @param {Intake_Forms_Field_Type_SelectInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_select: ((inputs?: Intake_Forms_Field_Type_SelectInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Type_SelectInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Type_SelectInputs = {};
