/**
* | output |
* | --- |
* | "Hold to preview {sub}" |
*
* @param {Demo_Figure_Aria_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_figure_aria_label: ((inputs: Demo_Figure_Aria_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Figure_Aria_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Figure_Aria_LabelInputs = {
    sub: NonNullable<unknown>;
};
