/**
* | output |
* | --- |
* | "Recovering messages: {done} of {total}" |
*
* @param {Reseed_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_progress: ((inputs: Reseed_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_ProgressInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
