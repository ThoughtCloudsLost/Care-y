/**
* | output |
* | --- |
* | "Current link (not listed)" |
*
* @param {Fund_Link_MissingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_link_missing: ((inputs?: Fund_Link_MissingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Link_MissingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Link_MissingInputs = {};
