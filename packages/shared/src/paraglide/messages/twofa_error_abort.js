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

const en_xa2_twofa_error_abort = /** @type {(inputs: Twofa_Error_AbortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèqùèst tìmèd òùt. Try àgàìn. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Request timed out. Try again." |
*
* @param {Twofa_Error_AbortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_abort = /** @type {((inputs?: Twofa_Error_AbortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_AbortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_error_abort(inputs)
	if (locale === "en-XA") return en_xa2_twofa_error_abort(inputs)
	return en_twofa_error_abort(inputs)
});