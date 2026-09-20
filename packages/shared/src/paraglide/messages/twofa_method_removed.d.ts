/**
* | output |
* | --- |
* | "Verification method removed" |
*
* @param {Twofa_Method_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_method_removed: ((inputs?: Twofa_Method_RemovedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Method_RemovedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Method_RemovedInputs = {};
