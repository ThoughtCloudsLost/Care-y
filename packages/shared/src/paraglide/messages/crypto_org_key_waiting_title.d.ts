/**
* | output |
* | --- |
* | "Waiting for Key Distribution" |
*
* @param {Crypto_Org_Key_Waiting_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_title: ((inputs?: Crypto_Org_Key_Waiting_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Crypto_Org_Key_Waiting_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Crypto_Org_Key_Waiting_TitleInputs = {};
