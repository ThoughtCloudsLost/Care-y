/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Totp_LabelInputs */

const en_twofa_totp_label = /** @type {(inputs: Twofa_Totp_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Authenticator app`)
};

const es_twofa_totp_label = /** @type {(inputs: Twofa_Totp_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aplicación de autenticación`)
};

/**
* | output |
* | --- |
* | "Authenticator app" |
*
* @param {Twofa_Totp_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_label = /** @type {((inputs?: Twofa_Totp_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_totp_label(inputs)
	return es_twofa_totp_label(inputs)
});