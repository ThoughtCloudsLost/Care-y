/**
* | output |
* | --- |
* | "This secure link is not available. It may have been revoked or never existed." |
*
* @param {Error_Portal_Channel_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_not_found: ((inputs?: Error_Portal_Channel_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Channel_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Channel_Not_FoundInputs = {};
