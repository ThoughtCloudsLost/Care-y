/**
* | output |
* | --- |
* | "Decrypting ticket titles" |
*
* @param {Demo_Tickets_DescrambleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_descramble: ((inputs?: Demo_Tickets_DescrambleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_DescrambleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_DescrambleInputs = {};
