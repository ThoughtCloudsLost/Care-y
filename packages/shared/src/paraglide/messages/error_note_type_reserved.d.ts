/**
* | output |
* | --- |
* | "This note type is managed by the system and cannot be changed." |
*
* @param {Error_Note_Type_ReservedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_note_type_reserved: ((inputs?: Error_Note_Type_ReservedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Note_Type_ReservedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Note_Type_ReservedInputs = {};
