/**
* | output |
* | --- |
* | "{done} of {total} complete" |
*
* @param {Getting_Started_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_progress: ((inputs: Getting_Started_ProgressInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_ProgressInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_ProgressInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
