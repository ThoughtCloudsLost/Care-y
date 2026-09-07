/**
* | output |
* | --- |
* | "Secure messaging is not enabled for this organization." |
*
* @param {Error_Portal_Channel_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_channel_disabled: ((inputs?: Error_Portal_Channel_DisabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Channel_DisabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Channel_DisabledInputs = {};
