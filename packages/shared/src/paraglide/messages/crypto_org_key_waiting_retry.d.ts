/**
* | output |
* | --- |
* | "Checking..." |
*
* @param {Crypto_Org_Key_Waiting_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_retry: ((inputs?: Crypto_Org_Key_Waiting_RetryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Crypto_Org_Key_Waiting_RetryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Crypto_Org_Key_Waiting_RetryInputs = {};
