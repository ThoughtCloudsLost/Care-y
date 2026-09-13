/**
* | output |
* | --- |
* | "Jump to latest" |
*
* @param {Thread_Jump_To_LatestInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const thread_jump_to_latest: ((inputs?: Thread_Jump_To_LatestInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Thread_Jump_To_LatestInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Thread_Jump_To_LatestInputs = {};
