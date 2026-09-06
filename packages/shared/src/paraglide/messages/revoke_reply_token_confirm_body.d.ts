/**
* | output |
* | --- |
* | "The client will no longer be able to reply to emails for this ticket. A new token will be created on the next outbound email." |
*
* @param {Revoke_Reply_Token_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_body: ((inputs?: Revoke_Reply_Token_Confirm_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_Confirm_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_Confirm_BodyInputs = {};
