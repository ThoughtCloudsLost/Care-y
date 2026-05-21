/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_UsernameInputs */

const en_auth_username = /** @type {(inputs: Auth_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_auth_username = /** @type {(inputs: Auth_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesion`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Auth_UsernameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_username = /** @type {((inputs?: Auth_UsernameInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_UsernameInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_username(inputs)
	return es_auth_username(inputs)
});