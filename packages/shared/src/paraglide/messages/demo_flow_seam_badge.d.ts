/**
* | output |
* | --- |
* | "Scripted in the handbook" |
*
* @param {Demo_Flow_Seam_BadgeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_badge: ((inputs?: Demo_Flow_Seam_BadgeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Seam_BadgeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Seam_BadgeInputs = {};
