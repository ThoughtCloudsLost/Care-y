/**
* | output |
* | --- |
* | "This link has already been opened and cannot be viewed again." |
*
* @param {Share_View_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_opened: ((inputs?: Share_View_OpenedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_View_OpenedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_View_OpenedInputs = {};
