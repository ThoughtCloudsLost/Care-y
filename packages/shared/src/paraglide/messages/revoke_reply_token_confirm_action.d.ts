/**
* | output |
* | --- |
* | "Revoke" |
*
* @param {Revoke_Reply_Token_Confirm_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_action: ((inputs?: Revoke_Reply_Token_Confirm_ActionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_Confirm_ActionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_Confirm_ActionInputs = {};
