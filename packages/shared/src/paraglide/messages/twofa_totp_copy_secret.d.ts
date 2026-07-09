/**
* | output |
* | --- |
* | "Copy setup code" |
*
* @param {Twofa_Totp_Copy_SecretInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_copy_secret: ((inputs?: Twofa_Totp_Copy_SecretInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Totp_Copy_SecretInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Totp_Copy_SecretInputs = {};
