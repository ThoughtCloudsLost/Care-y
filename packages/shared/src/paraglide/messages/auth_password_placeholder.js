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

const en_xa2_auth_password_placeholder = /** @type {(inputs: Auth_Password_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr yòùr pàsswòrd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter your password" |
*
* @param {Auth_Password_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_password_placeholder = /** @type {((inputs?: Auth_Password_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Password_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_password_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_auth_password_placeholder(inputs)
	return en_auth_password_placeholder(inputs)
});