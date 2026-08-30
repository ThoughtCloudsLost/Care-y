/**
* | output |
* | --- |
* | "Expired link" |
*
* @param {Share_View_Expired_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_expired_title: ((inputs?: Share_View_Expired_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_Expired_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_Expired_TitleInputs = {};
