/**
* | output |
* | --- |
* | "Timeline" |
*
* @param {Demo_Topic_TimelineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_timeline: ((inputs?: Demo_Topic_TimelineInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_TimelineInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_TimelineInputs = {};
