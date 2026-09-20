/**
* | output |
* | --- |
* | "Revoke email reply token" |
*
* @param {Revoke_Reply_Token_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const revoke_reply_token_label: ((inputs?: Revoke_Reply_Token_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Revoke_Reply_Token_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Revoke_Reply_Token_LabelInputs = {};
