/**
* | output |
* | --- |
* | "Recovering messages: {done} of {total}" |
*
* @param {Reseed_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reseed_progress: ((inputs: Reseed_ProgressInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_ProgressInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_ProgressInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
