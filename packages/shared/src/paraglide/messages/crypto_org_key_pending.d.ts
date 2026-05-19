/**
* | output |
* | --- |
* | "Your encryption keys are being set up by an administrator. Some content may not be visible yet." |
*
* @param {Crypto_Org_Key_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_pending: ((inputs?: Crypto_Org_Key_PendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Crypto_Org_Key_PendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Crypto_Org_Key_PendingInputs = {};
