/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Methods_EnrolledInputs */

const en_error_no_methods_enrolled = /** @type {(inputs: Error_No_Methods_EnrolledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No two-factor methods enrolled. Set up at least one method first.`)
};

const es_error_no_methods_enrolled = /** @type {(inputs: Error_No_Methods_EnrolledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay métodos de verificación registrados. Configure al menos uno primero.`)
};

/**
* | output |
* | --- |
* | "No two-factor methods enrolled. Set up at least one method first." |
*
* @param {Error_No_Methods_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_methods_enrolled = /** @type {((inputs?: Error_No_Methods_EnrolledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Methods_EnrolledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_no_methods_enrolled(inputs)
	return es_error_no_methods_enrolled(inputs)
});