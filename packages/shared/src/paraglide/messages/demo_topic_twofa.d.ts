/**
* | output |
* | --- |
* | "Two-factor auth" |
*
* @param {Demo_Topic_TwofaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_twofa: ((inputs?: Demo_Topic_TwofaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_TwofaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_TwofaInputs = {};
