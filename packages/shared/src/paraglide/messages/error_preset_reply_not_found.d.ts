/**
* | output |
* | --- |
* | "Preset reply not found." |
*
* @param {Error_Preset_Reply_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_preset_reply_not_found: ((inputs?: Error_Preset_Reply_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Preset_Reply_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Preset_Reply_Not_FoundInputs = {};
