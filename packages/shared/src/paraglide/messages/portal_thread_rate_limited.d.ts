/**
* | output |
* | --- |
* | "Your messages are paused for a moment because too many loaded in a short time. Your link still works. This page will try again on its own." |
*
* @param {Portal_Thread_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_thread_rate_limited: ((inputs?: Portal_Thread_Rate_LimitedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Thread_Rate_LimitedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Thread_Rate_LimitedInputs = {};
