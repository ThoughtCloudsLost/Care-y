/**
* | output |
* | --- |
* | "Cross-cutting entries that cover the protection model in depth. They explain encryption, key derivation, the trust boundary, retention, permissions, the tele..." |
*
* @param {Demo_Section_Deepdive_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_deepdive_desc: ((inputs?: Demo_Section_Deepdive_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Deepdive_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Deepdive_DescInputs = {};
