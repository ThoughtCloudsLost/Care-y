/**
* | output |
* | --- |
* | "Cancel recovery" |
*
* @param {Reseed_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_cancel: ((inputs?: Reseed_CancelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_CancelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_CancelInputs = {};
