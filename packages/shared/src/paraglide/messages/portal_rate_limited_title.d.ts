/**
* | output |
* | --- |
* | "Taking a short pause" |
*
* @param {Portal_Rate_Limited_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_rate_limited_title: ((inputs?: Portal_Rate_Limited_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Rate_Limited_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Rate_Limited_TitleInputs = {};
