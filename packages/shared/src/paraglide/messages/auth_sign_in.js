/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Sign_InInputs */

const en_auth_sign_in = /** @type {(inputs: Auth_Sign_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in`)
};

const es_auth_sign_in = /** @type {(inputs: Auth_Sign_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciar sesión`)
};

/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Sign_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_sign_in = /** @type {((inputs?: Auth_Sign_InInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Sign_InInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_sign_in(inputs)
	return es_auth_sign_in(inputs)
});