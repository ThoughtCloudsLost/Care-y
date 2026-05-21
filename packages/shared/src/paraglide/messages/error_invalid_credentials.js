/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Invalid_CredentialsInputs */

const en_error_invalid_credentials = /** @type {(inputs: Error_Invalid_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invalid login username or password.`)
};

const es_error_invalid_credentials = /** @type {(inputs: Error_Invalid_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesion o contraseña incorrectos.`)
};

/**
* | output |
* | --- |
* | "Invalid login username or password." |
*
* @param {Error_Invalid_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_credentials = /** @type {((inputs?: Error_Invalid_CredentialsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Invalid_CredentialsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_invalid_credentials(inputs)
	return es_error_invalid_credentials(inputs)
});