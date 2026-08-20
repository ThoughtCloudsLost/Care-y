/**
* | output |
* | --- |
* | "Sort" |
*
* @param {Demo_Topic_SortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_sort: ((inputs?: Demo_Topic_SortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_SortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_SortInputs = {};
