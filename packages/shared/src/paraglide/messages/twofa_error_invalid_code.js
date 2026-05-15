/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_Invalid_CodeInputs */

const en_twofa_error_invalid_code = /** @type {(inputs: Twofa_Error_Invalid_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invalid code. Try again.`)
};

const es_twofa_error_invalid_code = /** @type {(inputs: Twofa_Error_Invalid_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código no válido. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Invalid code. Try again." |
*
* @param {Twofa_Error_Invalid_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_invalid_code = /** @type {((inputs?: Twofa_Error_Invalid_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Invalid_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_error_invalid_code(inputs)
	return es_twofa_error_invalid_code(inputs)
});