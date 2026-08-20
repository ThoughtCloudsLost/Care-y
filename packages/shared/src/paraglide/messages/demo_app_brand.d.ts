/**
* | output |
* | --- |
* | "CARE-Y" |
*
* @param {Demo_App_BrandInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_app_brand: ((inputs?: Demo_App_BrandInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_App_BrandInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_App_BrandInputs = {};
