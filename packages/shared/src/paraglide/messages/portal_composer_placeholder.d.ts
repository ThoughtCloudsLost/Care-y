/**
* | output |
* | --- |
* | "Write a reply..." |
*
* @param {Portal_Composer_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_composer_placeholder: ((inputs?: Portal_Composer_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Composer_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Composer_PlaceholderInputs = {};
