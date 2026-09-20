/**
* | output |
* | --- |
* | "Thread filters" |
*
* @param {Demo_Topic_Thread_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_thread_filters: ((inputs?: Demo_Topic_Thread_FiltersInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_Thread_FiltersInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_Thread_FiltersInputs = {};
