/**
* | output |
* | --- |
* | "Min: {min}" |
*
* @param {Intake_Forms_Field_Row_Min_OnlyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_min_only: ((inputs: Intake_Forms_Field_Row_Min_OnlyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Min_OnlyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Min_OnlyInputs = {
    min: NonNullable<unknown>;
};
