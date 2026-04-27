/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Admin_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_coming_soon: ((inputs?: Admin_Coming_SoonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Coming_SoonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Coming_SoonInputs = {};
