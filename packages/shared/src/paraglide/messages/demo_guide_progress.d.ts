/**
* | output |
* | --- |
* | "{done} of {total}" |
*
* @param {Demo_Guide_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_progress: ((inputs: Demo_Guide_ProgressInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_ProgressInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_ProgressInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
