/**
* | output |
* | --- |
* | "What's going on?" |
*
* @param {Intake_Field_Message_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_message_placeholder: ((inputs?: Intake_Field_Message_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Field_Message_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Field_Message_PlaceholderInputs = {};
