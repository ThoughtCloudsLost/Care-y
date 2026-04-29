/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Token_ExpiredInputs */

const en_error_token_expired = /** @type {(inputs: Error_Token_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The phone lookup token has expired. Please try again.`)
};

const es_error_token_expired = /** @type {(inputs: Error_Token_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El token de búsqueda de teléfono ha expirado. Intente de nuevo.`)
};

/**
* | output |
* | --- |
* | "The phone lookup token has expired. Please try again." |
*
* @param {Error_Token_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_token_expired = /** @type {((inputs?: Error_Token_ExpiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Token_ExpiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_token_expired(inputs)
	return es_error_token_expired(inputs)
});