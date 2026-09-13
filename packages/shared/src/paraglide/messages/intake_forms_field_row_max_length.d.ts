/**
* | output |
* | --- |
* | "Max length: {max}" |
*
* @param {Intake_Forms_Field_Row_Max_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_max_length: ((inputs: Intake_Forms_Field_Row_Max_LengthInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Max_LengthInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Max_LengthInputs = {
    max: NonNullable<unknown>;
};
