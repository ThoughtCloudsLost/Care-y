/**
* | output |
* | --- |
* | "Incomplete link" |
*
* @param {Share_View_Bad_Link_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_bad_link_title: ((inputs?: Share_View_Bad_Link_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_Bad_Link_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_Bad_Link_TitleInputs = {};
