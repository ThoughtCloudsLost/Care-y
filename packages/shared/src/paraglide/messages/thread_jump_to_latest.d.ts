/**
* | output |
* | --- |
* | "Jump to latest" |
*
* @param {Thread_Jump_To_LatestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const thread_jump_to_latest: ((inputs?: Thread_Jump_To_LatestInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Thread_Jump_To_LatestInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Thread_Jump_To_LatestInputs = {};
