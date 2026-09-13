/**
* | output |
* | --- |
* | "Remove {name}" |
*
* @param {Attachment_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_remove: ((inputs: Attachment_RemoveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_RemoveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_RemoveInputs = {
    name: NonNullable<unknown>;
};
