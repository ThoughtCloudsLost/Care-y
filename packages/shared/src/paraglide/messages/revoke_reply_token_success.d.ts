/**
* | output |
* | --- |
* | "Reply token revoked" |
*
* @param {Revoke_Reply_Token_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_success: ((inputs?: Revoke_Reply_Token_SuccessInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_SuccessInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_SuccessInputs = {};
