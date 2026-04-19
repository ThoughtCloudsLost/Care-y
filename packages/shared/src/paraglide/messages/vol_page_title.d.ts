/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Vol_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_page_title: ((inputs?: Vol_Page_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Page_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Page_TitleInputs = {};
