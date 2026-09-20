/**
* | output |
* | --- |
* | "{type}: {subtype}" |
*
* @param {Intake_Forms_Field_Row_SubtypeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_subtype: ((inputs: Intake_Forms_Field_Row_SubtypeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_SubtypeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_SubtypeInputs = {
    type: NonNullable<unknown>;
    subtype: NonNullable<unknown>;
};
