/**
* | output |
* | --- |
* | "Date" |
*
* @param {Intake_Forms_Field_Type_DateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_type_date: ((inputs?: Intake_Forms_Field_Type_DateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Type_DateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Type_DateInputs = {};
