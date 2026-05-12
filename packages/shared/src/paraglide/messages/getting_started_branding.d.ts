/**
* | output |
* | --- |
* | "Customize branding" |
*
* @param {Getting_Started_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_branding: ((inputs?: Getting_Started_BrandingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_BrandingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_BrandingInputs = {};
