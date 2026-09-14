/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Portal_Passphrase_Already_SetInputs */

const en_error_portal_passphrase_already_set = /** @type {(inputs: Error_Portal_Passphrase_Already_SetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link already has a password.`)
};

const es_error_portal_passphrase_already_set = /** @type {(inputs: Error_Portal_Passphrase_Already_SetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace ya tiene una contraseña.`)
};

/**
* | output |
* | --- |
* | "This link already has a password." |
*
* @param {Error_Portal_Passphrase_Already_SetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_passphrase_already_set = /** @type {((inputs?: Error_Portal_Passphrase_Already_SetInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Passphrase_Already_SetInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_passphrase_already_set(inputs)
	return en_error_portal_passphrase_already_set(inputs)
});