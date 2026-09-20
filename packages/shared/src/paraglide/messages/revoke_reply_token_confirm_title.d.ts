/**
* | output |
* | --- |
* | "Revoke reply token?" |
*
* @param {Revoke_Reply_Token_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_title: ((inputs?: Revoke_Reply_Token_Confirm_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_Confirm_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_Confirm_TitleInputs = {};
