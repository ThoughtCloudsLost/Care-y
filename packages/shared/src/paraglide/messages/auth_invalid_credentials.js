/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Invalid_CredentialsInputs */

const en_auth_invalid_credentials = /** @type {(inputs: Auth_Invalid_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invalid username or password`)
};

const es_auth_invalid_credentials = /** @type {(inputs: Auth_Invalid_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario o contraseña incorrectos`)
};

/**
* | output |
* | --- |
* | "Invalid username or password" |
*
* @param {Auth_Invalid_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_invalid_credentials = /** @type {((inputs?: Auth_Invalid_CredentialsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Invalid_CredentialsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_invalid_credentials(inputs)
	return es_auth_invalid_credentials(inputs)
});