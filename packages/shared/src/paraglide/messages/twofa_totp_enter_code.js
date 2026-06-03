/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Totp_Enter_CodeInputs */

const en_twofa_totp_enter_code = /** @type {(inputs: Twofa_Totp_Enter_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the 6-digit code`)
};

const es_twofa_totp_enter_code = /** @type {(inputs: Twofa_Totp_Enter_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa el código de 6 dígitos`)
};

/**
* | output |
* | --- |
* | "Enter the 6-digit code" |
*
* @param {Twofa_Totp_Enter_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_enter_code = /** @type {((inputs?: Twofa_Totp_Enter_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Enter_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_totp_enter_code(inputs)
	return es_twofa_totp_enter_code(inputs)
});