/**
* | output |
* | --- |
* | "Step {step} of {total}" |
*
* @param {Demo_Step_OfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_step_of: ((inputs: Demo_Step_OfInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Step_OfInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Step_OfInputs = {
    step: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
