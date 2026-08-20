/**
* | output |
* | --- |
* | "This link has now been used and cannot be opened again. Save what you need before closing this page." |
*
* @param {Share_View_One_Time_NoticeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_one_time_notice: ((inputs?: Share_View_One_Time_NoticeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_One_Time_NoticeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_One_Time_NoticeInputs = {};
