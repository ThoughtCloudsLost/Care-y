/**
* | output |
* | --- |
* | "Your messages are encrypted before they leave your device. Only assigned volunteers can read them." |
*
* @param {Portal_Web_Chat_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_web_chat_hint: ((inputs?: Portal_Web_Chat_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Web_Chat_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Web_Chat_HintInputs = {};
