/**
* | output |
* | --- |
* | "Request" |
*
* @param {Note_Type_RequestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_request: ((inputs?: Note_Type_RequestInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_RequestInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_RequestInputs = {};
