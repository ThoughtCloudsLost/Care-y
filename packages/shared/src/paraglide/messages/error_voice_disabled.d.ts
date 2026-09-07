/**
* | output |
* | --- |
* | "Voice calls are not enabled for this organization." |
*
* @param {Error_Voice_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_voice_disabled: ((inputs?: Error_Voice_DisabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Voice_DisabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Voice_DisabledInputs = {};
