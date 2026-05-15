/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Totp_Scan_QrInputs */

const en_twofa_totp_scan_qr = /** @type {(inputs: Twofa_Totp_Scan_QrInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Scan this code with your authenticator app`)
};

const es_twofa_totp_scan_qr = /** @type {(inputs: Twofa_Totp_Scan_QrInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escanea este código con tu aplicación de autenticación`)
};

/**
* | output |
* | --- |
* | "Scan this code with your authenticator app" |
*
* @param {Twofa_Totp_Scan_QrInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_scan_qr = /** @type {((inputs?: Twofa_Totp_Scan_QrInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Scan_QrInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_totp_scan_qr(inputs)
	return es_twofa_totp_scan_qr(inputs)
});