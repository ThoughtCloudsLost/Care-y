/**
* | output |
* | --- |
* | "Volunteers cannot place calls to clients." |
*
* @param {Admin_Channel_Voice_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_channel_voice_off_hint: ((inputs?: Admin_Channel_Voice_Off_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Channel_Voice_Off_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Channel_Voice_Off_HintInputs = {};
