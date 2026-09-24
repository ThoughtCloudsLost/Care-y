/**
* | output |
* | --- |
* | "You have a secure message: {url}" |
*
* @param {Share_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_sms_body: ((inputs: Share_Sms_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sms_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sms_BodyInputs = {
    url: NonNullable<unknown>;
};
