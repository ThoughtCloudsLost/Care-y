/**
* | output |
* | --- |
* | "Check that you opened the complete link from your message." |
*
* @param {Share_View_Bad_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_bad_link: ((inputs?: Share_View_Bad_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_Bad_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_Bad_LinkInputs = {};
