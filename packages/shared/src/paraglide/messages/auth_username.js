/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_UsernameInputs */

const en_auth_username = /** @type {(inputs: Auth_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_auth_username = /** @type {(inputs: Auth_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesión`)
};

const en_xa2_auth_username = /** @type {(inputs: Auth_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògìn Ùsèrnàmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Auth_UsernameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_username = /** @type {((inputs?: Auth_UsernameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_UsernameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_username(inputs)
	if (locale === "en-XA") return en_xa2_auth_username(inputs)
	return en_auth_username(inputs)
});