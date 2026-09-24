/**
* | output |
* | --- |
* | "Min: {min}" |
*
* @param {Intake_Forms_Field_Row_Min_OnlyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_min_only: ((inputs: Intake_Forms_Field_Row_Min_OnlyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Min_OnlyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Min_OnlyInputs = {
    min: NonNullable<unknown>;
};
