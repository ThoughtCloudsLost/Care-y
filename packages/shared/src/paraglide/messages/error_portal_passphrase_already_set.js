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

const en_xa2_error_portal_passphrase_already_set = /** @type {(inputs: Error_Portal_Passphrase_Already_SetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk àlrèàdy hàs à pàsswòrd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link already has a password." |
*
* @param {Error_Portal_Passphrase_Already_SetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_passphrase_already_set = /** @type {((inputs?: Error_Portal_Passphrase_Already_SetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Portal_Passphrase_Already_SetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_portal_passphrase_already_set(inputs)
	if (locale === "en-XA") return en_xa2_error_portal_passphrase_already_set(inputs)
	return en_error_portal_passphrase_already_set(inputs)
});