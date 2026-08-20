/**
* | output |
* | --- |
* | "Note" |
*
* @param {Demo_Conversation_Note_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_note_label: ((inputs?: Demo_Conversation_Note_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Conversation_Note_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Conversation_Note_LabelInputs = {};
