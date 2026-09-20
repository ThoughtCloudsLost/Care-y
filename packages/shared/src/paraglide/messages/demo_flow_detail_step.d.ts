/**
* | output |
* | --- |
* | "Step {index} of {count}" |
*
* @param {Demo_Flow_Detail_StepInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_step: ((inputs: Demo_Flow_Detail_StepInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_StepInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_StepInputs = {
    index: NonNullable<unknown>;
    count: NonNullable<unknown>;
};
