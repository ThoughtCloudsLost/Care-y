/**
* | output |
* | --- |
* | "Internal · {name}" |
*
* @param {Preview_Note_InternalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const preview_note_internal: ((inputs: Preview_Note_InternalInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Preview_Note_InternalInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Preview_Note_InternalInputs = {
    name: NonNullable<unknown>;
};
