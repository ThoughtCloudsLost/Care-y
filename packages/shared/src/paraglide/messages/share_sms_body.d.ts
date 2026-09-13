/**
* | output |
* | --- |
* | "You have a secure message: {url}" |
*
* @param {Share_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sms_body: ((inputs: Share_Sms_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Sms_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Sms_BodyInputs = {
    url: NonNullable<unknown>;
};
