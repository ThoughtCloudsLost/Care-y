/**
* | output |
* | --- |
* | "..." |
*
* @param {Saved_Filter_DecryptingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_decrypting: ((inputs?: Saved_Filter_DecryptingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Saved_Filter_DecryptingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Saved_Filter_DecryptingInputs = {};
