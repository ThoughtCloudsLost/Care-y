/**
* | output |
* | --- |
* | "This link has expired and is no longer available." |
*
* @param {Share_View_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_expired: ((inputs?: Share_View_ExpiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_ExpiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_ExpiredInputs = {};
