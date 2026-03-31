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

/**
* | output |
* | --- |
* | "Invalid or expired verification code." |
*
* @param {Error_Invalid_Verification_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_verification_code = /** @type {((inputs?: Error_Invalid_Verification_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invalid_Verification_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_invalid_verification_code(inputs)
	return es_error_invalid_verification_code(inputs)
});