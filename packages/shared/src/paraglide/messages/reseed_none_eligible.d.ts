/**
* | output |
* | --- |
* | "No messages were eligible to recover." |
*
* @param {Reseed_None_EligibleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_none_eligible: ((inputs?: Reseed_None_EligibleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reseed_None_EligibleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reseed_None_EligibleInputs = {};
