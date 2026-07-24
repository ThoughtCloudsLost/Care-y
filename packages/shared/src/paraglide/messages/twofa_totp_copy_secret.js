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

/**
* | output |
* | --- |
* | "Copy setup code" |
*
* @param {Twofa_Totp_Copy_SecretInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_copy_secret = /** @type {((inputs?: Twofa_Totp_Copy_SecretInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Copy_SecretInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_totp_copy_secret(inputs)
	return es_twofa_totp_copy_secret(inputs)
});