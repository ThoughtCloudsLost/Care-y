/**
* | output |
* | --- |
* | "First name or alias" |
*
* @param {Intake_Field_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_field_name_placeholder: ((inputs?: Intake_Field_Name_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Field_Name_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Field_Name_PlaceholderInputs = {};
