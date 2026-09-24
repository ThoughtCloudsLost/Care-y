/**
* | output |
* | --- |
* | "Sidebar navigation" |
*
* @param {Nav_Sidebar_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_label: ((inputs?: Nav_Sidebar_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_Sidebar_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_Sidebar_LabelInputs = {};
