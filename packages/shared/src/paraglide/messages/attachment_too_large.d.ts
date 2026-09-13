/**
* | output |
* | --- |
* | "That file is larger than the {limit} limit." |
*
* @param {Attachment_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_too_large: ((inputs: Attachment_Too_LargeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_Too_LargeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_Too_LargeInputs = {
    limit: NonNullable<unknown>;
};
