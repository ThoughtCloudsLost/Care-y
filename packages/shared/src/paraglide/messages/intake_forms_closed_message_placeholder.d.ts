/**
* | output |
* | --- |
* | "Shown when the form has closed." |
*
* @param {Intake_Forms_Closed_Message_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closed_message_placeholder: ((inputs?: Intake_Forms_Closed_Message_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Closed_Message_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Closed_Message_PlaceholderInputs = {};
