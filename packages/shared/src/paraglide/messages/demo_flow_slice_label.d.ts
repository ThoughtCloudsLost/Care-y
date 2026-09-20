/**
* | output |
* | --- |
* | "Interaction {index}" |
*
* @param {Demo_Flow_Slice_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_label: ((inputs: Demo_Flow_Slice_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Slice_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Slice_LabelInputs = {
    index: NonNullable<unknown>;
};
