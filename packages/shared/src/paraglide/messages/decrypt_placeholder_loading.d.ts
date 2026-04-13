/**
* | output |
* | --- |
* | "Decrypting" |
*
* @param {Decrypt_Placeholder_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const decrypt_placeholder_loading: ((inputs?: Decrypt_Placeholder_LoadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Decrypt_Placeholder_LoadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Decrypt_Placeholder_LoadingInputs = {};
