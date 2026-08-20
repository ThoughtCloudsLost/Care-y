/**
* | output |
* | --- |
* | "Decrypting ticket titles" |
*
* @param {Demo_Tickets_DescrambleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_descramble: ((inputs?: Demo_Tickets_DescrambleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_DescrambleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_DescrambleInputs = {};
