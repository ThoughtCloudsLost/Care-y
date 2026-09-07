/**
* | output |
* | --- |
* | "SMS is not enabled for this organization." |
*
* @param {Error_Sms_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sms_disabled: ((inputs?: Error_Sms_DisabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Sms_DisabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Sms_DisabledInputs = {};
