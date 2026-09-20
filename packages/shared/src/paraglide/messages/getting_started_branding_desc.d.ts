/**
* | output |
* | --- |
* | "Upload a logo and set your organization's colors." |
*
* @param {Getting_Started_Branding_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_branding_desc: ((inputs?: Getting_Started_Branding_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Branding_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Branding_DescInputs = {};
