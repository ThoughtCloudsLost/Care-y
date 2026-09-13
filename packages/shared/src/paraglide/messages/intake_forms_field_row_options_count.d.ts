/**
* | output |
* | --- |
* | "{count} options" |
*
* @param {Intake_Forms_Field_Row_Options_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_options_count: ((inputs: Intake_Forms_Field_Row_Options_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Options_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Options_CountInputs = {
    count: NonNullable<unknown>;
};
