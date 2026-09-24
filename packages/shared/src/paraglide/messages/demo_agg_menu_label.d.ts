/**
* | output |
* | --- |
* | "Reference pages" |
*
* @param {Demo_Agg_Menu_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_agg_menu_label: ((inputs?: Demo_Agg_Menu_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Agg_Menu_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Agg_Menu_LabelInputs = {};
