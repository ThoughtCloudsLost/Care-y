/**
* | output |
* | --- |
* | "Open the portal link. If it carries a passphrase, enter the words given on the call." |
*
* @param {Demo_Guide_Client_Portal_Reply_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_portal_reply_step1: ((inputs?: Demo_Guide_Client_Portal_Reply_Step1Inputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_Client_Portal_Reply_Step1Inputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_Client_Portal_Reply_Step1Inputs = {};
