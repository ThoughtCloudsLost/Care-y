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

const en_xa2_twofa_totp_enter_code = /** @type {(inputs: Twofa_Totp_Enter_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr thè 6-dìgìt còdè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter the 6-digit code" |
*
* @param {Twofa_Totp_Enter_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_enter_code = /** @type {((inputs?: Twofa_Totp_Enter_CodeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Totp_Enter_CodeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_totp_enter_code(inputs)
	if (locale === "en-XA") return en_xa2_twofa_totp_enter_code(inputs)
	return en_twofa_totp_enter_code(inputs)
});