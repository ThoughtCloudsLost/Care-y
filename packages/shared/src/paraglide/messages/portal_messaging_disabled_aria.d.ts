/**
* | output |
* | --- |
* | "The organization has disabled messaging on this channel. You cannot send messages at this time." |
*
* @param {Portal_Messaging_Disabled_AriaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_messaging_disabled_aria: ((inputs?: Portal_Messaging_Disabled_AriaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Messaging_Disabled_AriaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Messaging_Disabled_AriaInputs = {};
