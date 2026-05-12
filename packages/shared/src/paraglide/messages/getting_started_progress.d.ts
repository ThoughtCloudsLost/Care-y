/**
* | output |
* | --- |
* | "{done} of {total} complete" |
*
* @param {Getting_Started_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_progress: ((inputs: Getting_Started_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_ProgressInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
