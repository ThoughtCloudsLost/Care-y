/**
* | output |
* | --- |
* | "{done} of {total}" |
*
* @param {Demo_Guide_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_guide_progress: ((inputs: Demo_Guide_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_ProgressInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
