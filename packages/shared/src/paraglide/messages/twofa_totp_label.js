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

const en_xa2_twofa_totp_label = /** @type {(inputs: Twofa_Totp_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùthèntìcàtòr àpp ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Authenticator app" |
*
* @param {Twofa_Totp_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_label = /** @type {((inputs?: Twofa_Totp_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_totp_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_totp_label(inputs)
	return en_twofa_totp_label(inputs)
});