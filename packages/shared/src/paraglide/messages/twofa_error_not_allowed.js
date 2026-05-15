/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_Not_AllowedInputs */

const en_twofa_error_not_allowed = /** @type {(inputs: Twofa_Error_Not_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Authenticator request was cancelled. Try again.`)
};

const es_twofa_error_not_allowed = /** @type {(inputs: Twofa_Error_Not_AllowedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La solicitud del autenticador fue cancelada. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Authenticator request was cancelled. Try again." |
*
* @param {Twofa_Error_Not_AllowedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_error_not_allowed = /** @type {((inputs?: Twofa_Error_Not_AllowedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Not_AllowedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_error_not_allowed(inputs)
	return es_twofa_error_not_allowed(inputs)
});