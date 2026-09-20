/**
* | output |
* | --- |
* | "Your encryption keys are derived from your password. The server never holds them." |
*
* @param {Vol_Protected_KeysInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_protected_keys: ((inputs?: Vol_Protected_KeysInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Protected_KeysInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Protected_KeysInputs = {};
