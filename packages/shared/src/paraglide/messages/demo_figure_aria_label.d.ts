/**
* | output |
* | --- |
* | "Hold to preview {sub}" |
*
* @param {Demo_Figure_Aria_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_figure_aria_label: ((inputs: Demo_Figure_Aria_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Figure_Aria_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Figure_Aria_LabelInputs = {
    sub: NonNullable<unknown>;
};
