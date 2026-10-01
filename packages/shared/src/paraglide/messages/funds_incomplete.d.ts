/**
* | output |
* | --- |
* | "Some entries could not be read, so these balances may be incomplete." |
*
* @param {Funds_IncompleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const funds_incomplete: ((inputs?: Funds_IncompleteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Funds_IncompleteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Funds_IncompleteInputs = {};
