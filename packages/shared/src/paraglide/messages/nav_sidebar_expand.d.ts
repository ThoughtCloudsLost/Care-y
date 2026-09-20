/**
* | output |
* | --- |
* | "Expand sidebar" |
*
* @param {Nav_Sidebar_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_expand: ((inputs?: Nav_Sidebar_ExpandInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_Sidebar_ExpandInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_Sidebar_ExpandInputs = {};
