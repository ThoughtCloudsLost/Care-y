/**
* | output |
* | --- |
* | "Remove {name}" |
*
* @param {Attachment_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_remove: ((inputs: Attachment_RemoveInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_RemoveInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_RemoveInputs = {
    name: NonNullable<unknown>;
};
