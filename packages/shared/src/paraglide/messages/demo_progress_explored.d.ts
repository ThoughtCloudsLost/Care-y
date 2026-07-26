/**
* | output |
* | --- |
* | "{seen} of {total} features explored" |
*
* @param {Demo_Progress_ExploredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_progress_explored: ((inputs: Demo_Progress_ExploredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Progress_ExploredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Progress_ExploredInputs = {
    seen: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
