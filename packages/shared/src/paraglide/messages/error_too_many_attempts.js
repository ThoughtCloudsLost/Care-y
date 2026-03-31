/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Too_Many_AttemptsInputs */

const en_error_too_many_attempts = /** @type {(inputs: Error_Too_Many_AttemptsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many attempts. Please request a new code.`)
};

const es_error_too_many_attempts = /** @type {(inputs: Error_Too_Many_AttemptsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiados intentos. Solicita un código nuevo.`)
};

/**
* | output |
* | --- |
* | "Too many attempts. Please request a new code." |
*
* @param {Error_Too_Many_AttemptsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_too_many_attempts = /** @type {((inputs?: Error_Too_Many_AttemptsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Too_Many_AttemptsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_too_many_attempts(inputs)
	return es_error_too_many_attempts(inputs)
});