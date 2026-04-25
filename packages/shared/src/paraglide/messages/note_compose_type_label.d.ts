/**
* | output |
* | --- |
* | "Note type" |
*
* @param {Note_Compose_Type_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_compose_type_label: ((inputs?: Note_Compose_Type_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Compose_Type_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Compose_Type_LabelInputs = {};
