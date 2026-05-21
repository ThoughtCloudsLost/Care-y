/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Username_PlaceholderInputs */

const en_auth_username_placeholder = /** @type {(inputs: Auth_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`your login username`)
};

const es_auth_username_placeholder = /** @type {(inputs: Auth_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`tu.usuario.de.sesion`)
};

/**
* | output |
* | --- |
* | "your login username" |
*
* @param {Auth_Username_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_username_placeholder = /** @type {((inputs?: Auth_Username_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Username_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_username_placeholder(inputs)
	return es_auth_username_placeholder(inputs)
});