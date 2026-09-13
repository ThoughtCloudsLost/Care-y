/**
* | output |
* | --- |
* | "{type}: {subtype}" |
*
* @param {Intake_Forms_Field_Row_SubtypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_subtype: ((inputs: Intake_Forms_Field_Row_SubtypeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_SubtypeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_SubtypeInputs = {
    type: NonNullable<unknown>;
    subtype: NonNullable<unknown>;
};
