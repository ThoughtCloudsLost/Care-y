/**
* | output |
* | --- |
* | "Back to handbook" |
*
* @param {Demo_Excursion_BackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_excursion_back: ((inputs?: Demo_Excursion_BackInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Excursion_BackInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Excursion_BackInputs = {};
