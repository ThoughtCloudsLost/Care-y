/**
* | output |
* | --- |
* | "Your messages are encrypted before they leave your device. Only your organization can read them, and once a volunteer picks up your case, only the volunteers..." |
*
* @param {Portal_Web_Chat_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_web_chat_hint: ((inputs?: Portal_Web_Chat_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Web_Chat_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Web_Chat_HintInputs = {};
