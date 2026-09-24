/**
* | output |
* | --- |
* | "{count} steps" |
*
* @param {Demo_Flow_Slice_StepsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_steps: ((inputs: Demo_Flow_Slice_StepsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Slice_StepsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Slice_StepsInputs = {
    count: NonNullable<unknown>;
};
