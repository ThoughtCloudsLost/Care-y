/**
* | output |
* | --- |
* | "Guides" |
*
* @param {Demo_Guides_Menu_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guides_menu_label: ((inputs?: Demo_Guides_Menu_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guides_Menu_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guides_Menu_LabelInputs = {};
