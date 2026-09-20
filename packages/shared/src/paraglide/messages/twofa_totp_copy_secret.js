/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Totp_Copy_SecretInputs */

const en_twofa_totp_copy_secret = /** @type {(inputs: Twofa_Totp_Copy_SecretInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy setup code`)
};

const es_twofa_totp_copy_secret = /** @type {(inputs: Twofa_Totp_Copy_SecretInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar código de configuración`)
};

const en_xa2_twofa_totp_copy_secret = /** @type {(inputs: Twofa_Totp_Copy_SecretInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còpy sètùp còdè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Copy setup code" |
*
* @param {Twofa_Totp_Copy_SecretInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_copy_secret = /** @type {((inputs?: Twofa_Totp_Copy_SecretInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Copy_SecretInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_totp_copy_secret(inputs)
	if (locale === "en-XA") return en_xa2_twofa_totp_copy_secret(inputs)
	return en_twofa_totp_copy_secret(inputs)
});