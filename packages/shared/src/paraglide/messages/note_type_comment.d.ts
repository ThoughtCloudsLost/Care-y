/**
* | output |
* | --- |
* | "Comment" |
*
* @param {Note_Type_CommentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_comment: ((inputs?: Note_Type_CommentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_CommentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_CommentInputs = {};
