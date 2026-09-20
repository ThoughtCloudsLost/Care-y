/**
* | output |
* | --- |
* | "Undo merge" |
*
* @param {Client_Merge_UndoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_undo: ((inputs?: Client_Merge_UndoInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_UndoInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_UndoInputs = {};
