/**
* | output |
* | --- |
* | "Return to the ticket and check the share status line. It reads Waiting, Opened, or Expired." |
*
* @param {Demo_Guide_Secure_Share_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_secure_share_step4: ((inputs?: Demo_Guide_Secure_Share_Step4Inputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_Secure_Share_Step4Inputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_Secure_Share_Step4Inputs = {};
