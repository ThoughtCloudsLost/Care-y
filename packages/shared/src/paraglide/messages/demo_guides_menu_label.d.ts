/**
* | output |
* | --- |
* | "Guides" |
*
* @param {Demo_Guides_Menu_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_guides_menu_label: ((inputs?: Demo_Guides_Menu_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guides_Menu_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guides_Menu_LabelInputs = {};
