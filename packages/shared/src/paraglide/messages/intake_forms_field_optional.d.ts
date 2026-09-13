/**
* | output |
* | --- |
* | "optional" |
*
* @param {Intake_Forms_Field_OptionalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_optional: ((inputs?: Intake_Forms_Field_OptionalInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_OptionalInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_OptionalInputs = {};
