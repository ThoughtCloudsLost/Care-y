/**
* | output |
* | --- |
* | "Collapse sidebar" |
*
* @param {Nav_Sidebar_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_collapse: ((inputs?: Nav_Sidebar_CollapseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_Sidebar_CollapseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_Sidebar_CollapseInputs = {};
