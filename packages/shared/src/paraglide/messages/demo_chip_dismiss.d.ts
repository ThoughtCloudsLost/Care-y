/**
* | output |
* | --- |
* | "Dismiss reading chip" |
*
* @param {Demo_Chip_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_chip_dismiss: ((inputs?: Demo_Chip_DismissInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Chip_DismissInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Chip_DismissInputs = {};
