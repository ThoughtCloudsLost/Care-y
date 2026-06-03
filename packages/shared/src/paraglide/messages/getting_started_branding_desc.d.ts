/**
* | output |
* | --- |
* | "Upload a logo and set your organization's colors." |
*
* @param {Getting_Started_Branding_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_branding_desc: ((inputs?: Getting_Started_Branding_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Branding_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Branding_DescInputs = {};
