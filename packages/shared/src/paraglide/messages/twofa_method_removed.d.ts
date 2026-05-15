/**
* | output |
* | --- |
* | "Verification method removed" |
*
* @param {Twofa_Method_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_method_removed: ((inputs?: Twofa_Method_RemovedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Method_RemovedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Method_RemovedInputs = {};
