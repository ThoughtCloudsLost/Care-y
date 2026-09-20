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

const en_xa2_auth_sign_in = /** @type {(inputs: Auth_Sign_InInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgn ìn •••⟧`)
};

/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Sign_InInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_sign_in = /** @type {((inputs?: Auth_Sign_InInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Sign_InInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_sign_in(inputs)
	if (locale === "en-XA") return en_xa2_auth_sign_in(inputs)
	return en_auth_sign_in(inputs)
});