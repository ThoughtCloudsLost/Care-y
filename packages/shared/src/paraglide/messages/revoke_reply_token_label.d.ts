/**
* | output |
* | --- |
* | "Revoke email reply token" |
*
* @param {Revoke_Reply_Token_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_label: ((inputs?: Revoke_Reply_Token_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_LabelInputs = {};
