/**
* | output |
* | --- |
* | "No access to this content" |
*
* @param {Decrypt_Placeholder_DeniedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const decrypt_placeholder_denied: ((inputs?: Decrypt_Placeholder_DeniedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Decrypt_Placeholder_DeniedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Decrypt_Placeholder_DeniedInputs = {};
