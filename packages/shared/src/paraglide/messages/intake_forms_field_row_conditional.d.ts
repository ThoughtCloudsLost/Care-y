/**
* | output |
* | --- |
* | "Conditional on: {field}" |
*
* @param {Intake_Forms_Field_Row_ConditionalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_conditional: ((inputs: Intake_Forms_Field_Row_ConditionalInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_ConditionalInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_ConditionalInputs = {
    field: NonNullable<unknown>;
};
