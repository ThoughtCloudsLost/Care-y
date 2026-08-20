/**
* | output |
* | --- |
* | "This link is missing information. If you received it by text, open the full link from your message." |
*
* @param {Portal_Incomplete_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_incomplete_link: ((inputs?: Portal_Incomplete_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Incomplete_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Incomplete_LinkInputs = {};
