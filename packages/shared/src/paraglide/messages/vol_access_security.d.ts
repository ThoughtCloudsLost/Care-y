/**
* | output |
* | --- |
* | "View your security status" |
*
* @param {Vol_Access_SecurityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_access_security: ((inputs?: Vol_Access_SecurityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Access_SecurityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Access_SecurityInputs = {};
