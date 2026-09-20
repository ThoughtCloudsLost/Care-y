/**
* | output |
* | --- |
* | "Check that you opened the complete link from your message." |
*
* @param {Share_View_Bad_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_bad_link: ((inputs?: Share_View_Bad_LinkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_Bad_LinkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_Bad_LinkInputs = {};
