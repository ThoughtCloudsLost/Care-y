/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Demo_Topic_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_reply: ((inputs?: Demo_Topic_ReplyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_ReplyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_ReplyInputs = {};
