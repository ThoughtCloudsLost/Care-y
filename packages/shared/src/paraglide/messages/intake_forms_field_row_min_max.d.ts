/**
* | output |
* | --- |
* | "Range: {min} to {max}" |
*
* @param {Intake_Forms_Field_Row_Min_MaxInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_min_max: ((inputs: Intake_Forms_Field_Row_Min_MaxInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Min_MaxInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Min_MaxInputs = {
    min: NonNullable<unknown>;
    max: NonNullable<unknown>;
};
