/**
* | output |
* | --- |
* | "Expired link" |
*
* @param {Portal_Dead_Link_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_dead_link_title: ((inputs?: Portal_Dead_Link_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Dead_Link_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Dead_Link_TitleInputs = {};
