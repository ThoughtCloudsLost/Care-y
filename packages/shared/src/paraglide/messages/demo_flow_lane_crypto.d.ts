/**
* | output |
* | --- |
* | "Encryption" |
*
* @param {Demo_Flow_Lane_CryptoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_crypto: ((inputs?: Demo_Flow_Lane_CryptoInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Lane_CryptoInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Lane_CryptoInputs = {};
