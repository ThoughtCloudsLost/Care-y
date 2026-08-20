/**
* | output |
* | --- |
* | "Handbook sections" |
*
* @param {Demo_Section_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_nav_label: ((inputs?: Demo_Section_Nav_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Nav_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Nav_LabelInputs = {};
