/**
* | output |
* | --- |
* | "More" |
*
* @param {Nav_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_more: ((inputs?: Nav_MoreInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_MoreInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_MoreInputs = {};
