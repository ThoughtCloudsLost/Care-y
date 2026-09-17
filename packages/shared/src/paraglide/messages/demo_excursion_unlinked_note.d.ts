/**
* | output |
* | --- |
* | "The simulator is unlinked while this guide is pinned." |
*
* @param {Demo_Excursion_Unlinked_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_excursion_unlinked_note: ((inputs?: Demo_Excursion_Unlinked_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Excursion_Unlinked_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Excursion_Unlinked_NoteInputs = {};
