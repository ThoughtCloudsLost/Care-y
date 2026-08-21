/**
* | output |
* | --- |
* | "Cryptographic key or derived secret. Never stored, held in memory for the session only." |
*
* @param {Demo_Flow_Kind_Key_Material_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_key_material_note: ((inputs?: Demo_Flow_Kind_Key_Material_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_Key_Material_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_Key_Material_NoteInputs = {};
