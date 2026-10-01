/**
* | output |
* | --- |
* | "What was it for? (optional)" |
*
* @param {Assist_Note_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_note_placeholder: ((inputs?: Assist_Note_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Assist_Note_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Assist_Note_PlaceholderInputs = {};
