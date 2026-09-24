/**
* | output |
* | --- |
* | "{count} items could not be recovered." |
*
* @param {Reseed_PartialInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_partial: ((inputs: Reseed_PartialInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_PartialInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_PartialInputs = {
    count: NonNullable<unknown>;
};
