/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Not_AuthenticatedInputs */

const en_error_not_authenticated = /** @type {(inputs: Error_Not_AuthenticatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You are not signed in.`)
};

const es_error_not_authenticated = /** @type {(inputs: Error_Not_AuthenticatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No has iniciado sesión.`)
};

/**
* | output |
* | --- |
* | "You are not signed in." |
*
* @param {Error_Not_AuthenticatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_not_authenticated = /** @type {((inputs?: Error_Not_AuthenticatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Not_AuthenticatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_not_authenticated(inputs)
	return es_error_not_authenticated(inputs)
});