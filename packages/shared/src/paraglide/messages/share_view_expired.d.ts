/**
* | output |
* | --- |
* | "This link has expired and is no longer available." |
*
* @param {Share_View_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_expired: ((inputs?: Share_View_ExpiredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_ExpiredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_ExpiredInputs = {};
