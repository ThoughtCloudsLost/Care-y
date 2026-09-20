/**
* | output |
* | --- |
* | "Revoke" |
*
* @param {Revoke_Reply_Token_Confirm_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_action: ((inputs?: Revoke_Reply_Token_Confirm_ActionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_Confirm_ActionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_Confirm_ActionInputs = {};
