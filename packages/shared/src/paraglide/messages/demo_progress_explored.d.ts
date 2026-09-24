/**
* | output |
* | --- |
* | "{seen} of {total} features explored" |
*
* @param {Demo_Progress_ExploredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_progress_explored: ((inputs: Demo_Progress_ExploredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Progress_ExploredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Progress_ExploredInputs = {
    seen: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
