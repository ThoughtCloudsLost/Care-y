/**
* | output |
* | --- |
* | "Combined {Tickets}" |
*
* @param {Followup_Type_Merge_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_merge_note: ((inputs: Followup_Type_Merge_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Merge_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Merge_NoteInputs = {
    Tickets: NonNullable<unknown>;
};
