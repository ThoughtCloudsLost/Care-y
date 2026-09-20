/**
* | output |
* | --- |
* | "Note type" |
*
* @param {Note_Compose_Type_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_compose_type_label: ((inputs?: Note_Compose_Type_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Compose_Type_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Compose_Type_LabelInputs = {};
