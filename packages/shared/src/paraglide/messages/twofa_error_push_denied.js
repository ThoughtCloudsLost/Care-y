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

const en_xa2_twofa_error_push_denied = /** @type {(inputs: Twofa_Error_Push_DeniedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèqùèst wàs dènìèd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Request was denied." |
*
* @param {Twofa_Error_Push_DeniedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_denied = /** @type {((inputs?: Twofa_Error_Push_DeniedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Push_DeniedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_error_push_denied(inputs)
	if (locale === "en-XA") return en_xa2_twofa_error_push_denied(inputs)
	return en_twofa_error_push_denied(inputs)
});