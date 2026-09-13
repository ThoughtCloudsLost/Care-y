/**
* | output |
* | --- |
* | "Revoke reply token?" |
*
* @param {Revoke_Reply_Token_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_confirm_title: ((inputs?: Revoke_Reply_Token_Confirm_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_Confirm_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_Confirm_TitleInputs = {};
