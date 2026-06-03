/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_AbortInputs */

const en_twofa_error_abort = /** @type {(inputs: Twofa_Error_AbortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Request timed out. Try again.`)
};

const es_twofa_error_abort = /** @type {(inputs: Twofa_Error_AbortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La solicitud expiró. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Request timed out. Try again." |
*
* @param {Twofa_Error_AbortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_abort = /** @type {((inputs?: Twofa_Error_AbortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_AbortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_error_abort(inputs)
	return es_twofa_error_abort(inputs)
});