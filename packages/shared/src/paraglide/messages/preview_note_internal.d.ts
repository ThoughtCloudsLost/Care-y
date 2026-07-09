/**
* | output |
* | --- |
* | "Internal · {name}" |
*
* @param {Preview_Note_InternalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const preview_note_internal: ((inputs: Preview_Note_InternalInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Preview_Note_InternalInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Preview_Note_InternalInputs = {
    name: NonNullable<unknown>;
};
