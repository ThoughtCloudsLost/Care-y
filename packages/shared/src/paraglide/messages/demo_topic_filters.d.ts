/**
* | output |
* | --- |
* | "Filters" |
*
* @param {Demo_Topic_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_filters: ((inputs?: Demo_Topic_FiltersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_FiltersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_FiltersInputs = {};
