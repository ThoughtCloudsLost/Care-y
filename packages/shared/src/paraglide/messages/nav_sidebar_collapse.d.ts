/**
* | output |
* | --- |
* | "Collapse sidebar" |
*
* @param {Nav_Sidebar_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_collapse: ((inputs?: Nav_Sidebar_CollapseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_Sidebar_CollapseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_Sidebar_CollapseInputs = {};
