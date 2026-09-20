/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Merge_Channel_Kind_Secure_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_secure_link: ((inputs?: Merge_Channel_Kind_Secure_LinkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_Kind_Secure_LinkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_Kind_Secure_LinkInputs = {};
