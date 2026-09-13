/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Error_Already_SetInputs */

const en_portal_passphrase_error_already_set = /** @type {(inputs: Portal_Passphrase_Error_Already_SetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A password has already been added to this link.`)
};

const es_portal_passphrase_error_already_set = /** @type {(inputs: Portal_Passphrase_Error_Already_SetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya se ha agregado una contraseña a este enlace.`)
};

/**
* | output |
* | --- |
* | "A password has already been added to this link." |
*
* @param {Portal_Passphrase_Error_Already_SetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_already_set = /** @type {((inputs?: Portal_Passphrase_Error_Already_SetInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Error_Already_SetInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_error_already_set(inputs)
	return es_portal_passphrase_error_already_set(inputs)
});