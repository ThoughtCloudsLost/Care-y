/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Invalid_Verification_CodeInputs */

const en_error_invalid_verification_code = /** @type {(inputs: Error_Invalid_Verification_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invalid or expired verification code.`)
};

const es_error_invalid_verification_code = /** @type {(inputs: Error_Invalid_Verification_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código de verificación inválido o expirado.`)
};

const en_xa2_error_invalid_verification_code = /** @type {(inputs: Error_Invalid_Verification_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnvàlìd òr èxpìrèd vèrìfìcàtìòn còdè. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Invalid or expired verification code." |
*
* @param {Error_Invalid_Verification_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_invalid_verification_code = /** @type {((inputs?: Error_Invalid_Verification_CodeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invalid_Verification_CodeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_invalid_verification_code(inputs)
	if (locale === "en-XA") return en_xa2_error_invalid_verification_code(inputs)
	return en_error_invalid_verification_code(inputs)
});