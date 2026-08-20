/**
* | output |
* | --- |
* | "View modes" |
*
* @param {Demo_Topic_View_ModesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_view_modes: ((inputs?: Demo_Topic_View_ModesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_View_ModesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_View_ModesInputs = {};
