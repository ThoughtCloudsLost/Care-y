/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Sign_In_ContinueInputs */

const en_auth_sign_in_continue = /** @type {(inputs: Auth_Sign_In_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in to continue`)
};

const es_auth_sign_in_continue = /** @type {(inputs: Auth_Sign_In_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inicia sesión para continuar`)
};

/**
* | output |
* | --- |
* | "Sign in to continue" |
*
* @param {Auth_Sign_In_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_sign_in_continue = /** @type {((inputs?: Auth_Sign_In_ContinueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Sign_In_ContinueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_sign_in_continue(inputs)
	return es_auth_sign_in_continue(inputs)
});