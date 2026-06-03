/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_ErrorInputs */

const en_auth_login_error = /** @type {(inputs: Auth_Login_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login failed. Please try again.`)
};

const es_auth_login_error = /** @type {(inputs: Auth_Login_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error de inicio de sesión. Inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "Login failed. Please try again." |
*
* @param {Auth_Login_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_login_error = /** @type {((inputs?: Auth_Login_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_login_error(inputs)
	return es_auth_login_error(inputs)
});