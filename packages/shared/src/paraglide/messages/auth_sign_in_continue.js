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

const en_xa2_auth_sign_in_continue = /** @type {(inputs: Auth_Sign_In_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgn ìn tò còntìnùè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Sign in to continue" |
*
* @param {Auth_Sign_In_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_sign_in_continue = /** @type {((inputs?: Auth_Sign_In_ContinueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Sign_In_ContinueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_sign_in_continue(inputs)
	if (locale === "en-XA") return en_xa2_auth_sign_in_continue(inputs)
	return en_auth_sign_in_continue(inputs)
});