/**
* | output |
* | --- |
* | "Open a ticket and tap Send secure link. Type the message and choose Send by SMS or Copy link." |
*
* @param {Demo_Guide_Secure_Share_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_secure_share_step1: ((inputs?: Demo_Guide_Secure_Share_Step1Inputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_Secure_Share_Step1Inputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_Secure_Share_Step1Inputs = {};
