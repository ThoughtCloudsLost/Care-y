/**
* | output |
* | --- |
* | "Timeline" |
*
* @param {Demo_Topic_TimelineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_timeline: ((inputs?: Demo_Topic_TimelineInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_TimelineInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_TimelineInputs = {};
