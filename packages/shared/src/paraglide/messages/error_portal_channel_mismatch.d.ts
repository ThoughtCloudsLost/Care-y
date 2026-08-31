/**
* | output |
* | --- |
* | "The secure link changed while recovering history. Generate a new link to continue." |
*
* @param {Error_Portal_Channel_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_mismatch: ((inputs?: Error_Portal_Channel_MismatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Channel_MismatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Channel_MismatchInputs = {};
