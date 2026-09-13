/**
* | output |
* | --- |
* | "Add field" |
*
* @param {Intake_Forms_Add_FieldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_add_field: ((inputs?: Intake_Forms_Add_FieldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Add_FieldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Add_FieldInputs = {};
