/**
* | output |
* | --- |
* | "Preset reply not found." |
*
* @param {Error_Preset_Reply_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_preset_reply_not_found: ((inputs?: Error_Preset_Reply_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Preset_Reply_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Preset_Reply_Not_FoundInputs = {};
