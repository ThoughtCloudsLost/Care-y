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

const en_xa2_twofa_error_push_timeout = /** @type {(inputs: Twofa_Error_Push_TimeoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìmèd òùt. Try àgàìn. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Timed out. Try again." |
*
* @param {Twofa_Error_Push_TimeoutInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_timeout = /** @type {((inputs?: Twofa_Error_Push_TimeoutInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Push_TimeoutInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_error_push_timeout(inputs)
	if (locale === "en-XA") return en_xa2_twofa_error_push_timeout(inputs)
	return en_twofa_error_push_timeout(inputs)
});