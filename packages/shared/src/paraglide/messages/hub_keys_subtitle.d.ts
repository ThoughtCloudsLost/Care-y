/**
* | output |
* | --- |
* | "Encryption key status and rotation" |
*
* @param {Hub_Keys_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_keys_subtitle: ((inputs?: Hub_Keys_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Keys_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Keys_SubtitleInputs = {};
