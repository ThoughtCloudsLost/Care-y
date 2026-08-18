/**
* | output |
* | --- |
* | "Your message" |
*
* @param {Intake_Field_Message_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_message_label: ((inputs?: Intake_Field_Message_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Field_Message_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Field_Message_LabelInputs = {};
