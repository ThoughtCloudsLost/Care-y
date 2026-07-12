/**
* | output |
* | --- |
* | "Unlocking and searching..." |
*
* @param {Search_Full_Progress_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_progress_title: ((inputs?: Search_Full_Progress_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_Progress_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_Progress_TitleInputs = {};
