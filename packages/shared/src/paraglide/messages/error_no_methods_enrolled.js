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

const en_xa2_error_no_methods_enrolled = /** @type {(inputs: Error_No_Methods_EnrolledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò twò-fàctòr mèthòds ènròllèd. Sèt ùp àt lèàst ònè mèthòd fìrst. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No two-factor methods enrolled. Set up at least one method first." |
*
* @param {Error_No_Methods_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_no_methods_enrolled = /** @type {((inputs?: Error_No_Methods_EnrolledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Methods_EnrolledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_no_methods_enrolled(inputs)
	if (locale === "en-XA") return en_xa2_error_no_methods_enrolled(inputs)
	return en_error_no_methods_enrolled(inputs)
});