/**
* | output |
* | --- |
* | "Already opened" |
*
* @param {Share_View_Opened_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_opened_title: ((inputs?: Share_View_Opened_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_Opened_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_Opened_TitleInputs = {};
