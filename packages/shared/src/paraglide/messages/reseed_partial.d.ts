/**
* | output |
* | --- |
* | "{count} items could not be recovered." |
*
* @param {Reseed_PartialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_partial: ((inputs: Reseed_PartialInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_PartialInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_PartialInputs = {
    count: NonNullable<unknown>;
};
