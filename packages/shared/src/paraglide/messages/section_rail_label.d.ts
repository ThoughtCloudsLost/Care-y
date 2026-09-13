/**
* | output |
* | --- |
* | "Page sections" |
*
* @param {Section_Rail_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const section_rail_label: ((inputs?: Section_Rail_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Section_Rail_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Section_Rail_LabelInputs = {};
