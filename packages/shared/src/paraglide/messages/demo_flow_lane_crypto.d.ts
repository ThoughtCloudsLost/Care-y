/**
* | output |
* | --- |
* | "Encryption" |
*
* @param {Demo_Flow_Lane_CryptoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_crypto: ((inputs?: Demo_Flow_Lane_CryptoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Lane_CryptoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Lane_CryptoInputs = {};
