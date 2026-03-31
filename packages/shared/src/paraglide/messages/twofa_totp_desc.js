/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Totp_DescInputs */

const en_twofa_totp_desc = /** @type {(inputs: Twofa_Totp_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A separate app on your phone generates a new 6-digit code every 30 seconds. Common apps include Google Authenticator and Authy. Works even without an internet connection.`)
};

const es_twofa_totp_desc = /** @type {(inputs: Twofa_Totp_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicación en tu teléfono genera un código de 6 dígitos cada 30 segundos. Aplicaciones comunes incluyen Google Authenticator y Authy. Funciona incluso sin conexión a internet.`)
};

/**
* | output |
* | --- |
* | "A separate app on your phone generates a new 6-digit code every 30 seconds. Common apps include Google Authenticator and Authy. Works even without an interne..." |
*
* @param {Twofa_Totp_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_desc = /** @type {((inputs?: Twofa_Totp_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_totp_desc(inputs)
	return es_twofa_totp_desc(inputs)
});