/**
* | output |
* | --- |
* | "Your account was created, but an administrator needs to distribute the organization encryption key to you. This usually happens automatically within a few se..." |
*
* @param {Crypto_Org_Key_Waiting_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_body: ((inputs?: Crypto_Org_Key_Waiting_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Crypto_Org_Key_Waiting_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Crypto_Org_Key_Waiting_BodyInputs = {};
