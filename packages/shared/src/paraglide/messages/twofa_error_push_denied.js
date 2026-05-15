/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_Push_DeniedInputs */

const en_twofa_error_push_denied = /** @type {(inputs: Twofa_Error_Push_DeniedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Request was denied.`)
};

const es_twofa_error_push_denied = /** @type {(inputs: Twofa_Error_Push_DeniedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La solicitud fue rechazada.`)
};

/**
* | output |
* | --- |
* | "Request was denied." |
*
* @param {Twofa_Error_Push_DeniedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_denied = /** @type {((inputs?: Twofa_Error_Push_DeniedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Push_DeniedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_error_push_denied(inputs)
	return es_twofa_error_push_denied(inputs)
});