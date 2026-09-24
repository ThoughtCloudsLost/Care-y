/**
* | output |
* | --- |
* | "Unlocking" |
*
* @param {Decrypt_Placeholder_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const decrypt_placeholder_loading: ((inputs?: Decrypt_Placeholder_LoadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Decrypt_Placeholder_LoadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Decrypt_Placeholder_LoadingInputs = {};
