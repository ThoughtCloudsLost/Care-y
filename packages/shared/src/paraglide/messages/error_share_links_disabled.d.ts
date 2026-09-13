/**
* | output |
* | --- |
* | "Share links are not enabled for this organization." |
*
* @param {Error_Share_Links_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_share_links_disabled: ((inputs?: Error_Share_Links_DisabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Share_Links_DisabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Share_Links_DisabledInputs = {};
