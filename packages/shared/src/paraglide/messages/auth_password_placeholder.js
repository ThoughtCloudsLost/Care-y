/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Password_PlaceholderInputs */

const en_auth_password_placeholder = /** @type {(inputs: Auth_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter your password`)
};

const es_auth_password_placeholder = /** @type {(inputs: Auth_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa tu contraseña`)
};

/**
* | output |
* | --- |
* | "Enter your password" |
*
* @param {Auth_Password_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_password_placeholder = /** @type {((inputs?: Auth_Password_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Password_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_password_placeholder(inputs)
	return es_auth_password_placeholder(inputs)
});