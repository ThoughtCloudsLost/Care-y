/**
* | output |
* | --- |
* | "{count} steps" |
*
* @param {Demo_Flow_Slice_StepsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_steps: ((inputs: Demo_Flow_Slice_StepsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Slice_StepsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Slice_StepsInputs = {
    count: NonNullable<unknown>;
};
