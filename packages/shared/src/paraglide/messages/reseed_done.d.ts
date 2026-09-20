/**
* | output |
* | --- |
* | "Message history recovered." |
*
* @param {Reseed_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_done: ((inputs?: Reseed_DoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_DoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_DoneInputs = {};
