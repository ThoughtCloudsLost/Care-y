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

const en_xa2_twofa_totp_scan_qr = /** @type {(inputs: Twofa_Totp_Scan_QrInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Scàn thìs còdè wìth yòùr àùthèntìcàtòr àpp •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Scan this code with your authenticator app" |
*
* @param {Twofa_Totp_Scan_QrInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_scan_qr = /** @type {((inputs?: Twofa_Totp_Scan_QrInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Scan_QrInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_totp_scan_qr(inputs)
	if (locale === "en-XA") return en_xa2_twofa_totp_scan_qr(inputs)
	return en_twofa_totp_scan_qr(inputs)
});