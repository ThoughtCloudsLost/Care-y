/**
* | output |
* | --- |
* | "Your messages could not load. This page will try again on its own." |
*
* @param {Portal_Thread_Load_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_thread_load_error: ((inputs?: Portal_Thread_Load_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Thread_Load_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Thread_Load_ErrorInputs = {};
