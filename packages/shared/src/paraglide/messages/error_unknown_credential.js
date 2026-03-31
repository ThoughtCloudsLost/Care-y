/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Unknown_CredentialInputs */

const en_error_unknown_credential = /** @type {(inputs: Error_Unknown_CredentialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unknown credential.`)
};

const es_error_unknown_credential = /** @type {(inputs: Error_Unknown_CredentialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Credencial desconocida.`)
};

/**
* | output |
* | --- |
* | "Unknown credential." |
*
* @param {Error_Unknown_CredentialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_unknown_credential = /** @type {((inputs?: Error_Unknown_CredentialInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Unknown_CredentialInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_unknown_credential(inputs)
	return es_error_unknown_credential(inputs)
});