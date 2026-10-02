/**
* | output |
* | --- |
* | "Donation provider funds could not be loaded. The current link is kept when you save." |
*
* @param {Fund_Link_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_link_unavailable: ((inputs?: Fund_Link_UnavailableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Link_UnavailableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Link_UnavailableInputs = {};
