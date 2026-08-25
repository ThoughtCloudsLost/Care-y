/**
* | output |
* | --- |
* | "Viewing mode" |
*
* @param {Demo_Mode_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_label: ((inputs?: Demo_Mode_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Mode_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Mode_LabelInputs = {};
