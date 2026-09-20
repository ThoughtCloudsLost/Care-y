/**
* | output |
* | --- |
* | "Select mode" |
*
* @param {Demo_Topic_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_select_mode: ((inputs?: Demo_Topic_Select_ModeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_Select_ModeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_Select_ModeInputs = {};
