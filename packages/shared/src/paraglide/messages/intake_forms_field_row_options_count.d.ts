/**
* | output |
* | --- |
* | "{count} options" |
*
* @param {Intake_Forms_Field_Row_Options_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_options_count: ((inputs: Intake_Forms_Field_Row_Options_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_Options_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_Options_CountInputs = {
    count: NonNullable<unknown>;
};
