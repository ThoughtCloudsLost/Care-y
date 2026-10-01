/**
* | output |
* | --- |
* | "No funds are set up yet." |
*
* @param {Assist_No_FundsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_no_funds: ((inputs?: Assist_No_FundsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Assist_No_FundsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Assist_No_FundsInputs = {};
