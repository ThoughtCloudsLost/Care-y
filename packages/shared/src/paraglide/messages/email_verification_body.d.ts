/**
* | output |
* | --- |
* | "Your verification code is: {code}. This code expires in 5 minutes. If you did not request this code, you can safely ignore this email." |
*
* @param {Email_Verification_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const email_verification_body: ((inputs: Email_Verification_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Email_Verification_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Email_Verification_BodyInputs = {
    code: NonNullable<unknown>;
};
