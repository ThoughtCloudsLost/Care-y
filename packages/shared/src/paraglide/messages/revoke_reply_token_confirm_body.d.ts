/**
* | output |
* | --- |
* | "The client will no longer be able to reply to emails for this ticket. A new token will be created on the next outbound email." |
*
* @param {Revoke_Reply_Token_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_body: ((inputs?: Revoke_Reply_Token_Confirm_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_Confirm_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_Confirm_BodyInputs = {};
