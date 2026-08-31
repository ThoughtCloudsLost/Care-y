/**
* | output |
* | --- |
* | "Recovery failed. You can retry or close and try again later." |
*
* @param {Reseed_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_error: ((inputs?: Reseed_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_ErrorInputs = {};
