/**
* | output |
* | --- |
* | "Logs" |
*
* @param {Logs_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_page_title: ((inputs?: Logs_Page_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Page_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Page_TitleInputs = {};
