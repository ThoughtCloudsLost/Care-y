/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Merge_Channel_Kind_Secure_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_kind_secure_link: ((inputs?: Merge_Channel_Kind_Secure_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_Kind_Secure_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_Kind_Secure_LinkInputs = {};
