/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Username_PlaceholderInputs */

const en_auth_username_placeholder = /** @type {(inputs: Auth_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`your login username`)
};

const es_auth_username_placeholder = /** @type {(inputs: Auth_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`tu.usuario.de.sesión`)
};

const en_xa2_auth_username_placeholder = /** @type {(inputs: Auth_Username_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦yòùr lògìn ùsèrnàmè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "your login username" |
*
* @param {Auth_Username_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_username_placeholder = /** @type {((inputs?: Auth_Username_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Username_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_username_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_auth_username_placeholder(inputs)
	return en_auth_username_placeholder(inputs)
});