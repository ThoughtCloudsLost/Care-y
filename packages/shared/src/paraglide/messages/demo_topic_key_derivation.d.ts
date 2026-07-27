/**
* | output |
* | --- |
* | "Key derivation" |
*
* @param {Demo_Topic_Key_DerivationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_key_derivation: ((inputs?: Demo_Topic_Key_DerivationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_Key_DerivationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_Key_DerivationInputs = {};
