/**
* | output |
* | --- |
* | "Link not found" |
*
* @param {Share_View_Not_Found_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_not_found_title: ((inputs?: Share_View_Not_Found_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_Not_Found_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_Not_Found_TitleInputs = {};
