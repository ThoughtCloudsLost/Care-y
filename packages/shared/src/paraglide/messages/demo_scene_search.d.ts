/**
* | output |
* | --- |
* | "Search" |
*
* @param {Demo_Scene_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_scene_search: ((inputs?: Demo_Scene_SearchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Scene_SearchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Scene_SearchInputs = {};
