/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_Push_TimeoutInputs */

const en_twofa_error_push_timeout = /** @type {(inputs: Twofa_Error_Push_TimeoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Timed out. Try again.`)
};

const es_twofa_error_push_timeout = /** @type {(inputs: Twofa_Error_Push_TimeoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tiempo agotado. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Timed out. Try again." |
*
* @param {Twofa_Error_Push_TimeoutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_timeout = /** @type {((inputs?: Twofa_Error_Push_TimeoutInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Push_TimeoutInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_error_push_timeout(inputs)
	return es_twofa_error_push_timeout(inputs)
});