/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Error_StaleInputs */

const en_portal_passphrase_error_stale = /** @type {(inputs: Portal_Passphrase_Error_StaleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New messages arrived while adding the password. Refreshing, please try again.`)
};

const es_portal_passphrase_error_stale = /** @type {(inputs: Portal_Passphrase_Error_StaleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llegaron mensajes nuevos mientras se agregaba la contraseña. Actualizando, intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "New messages arrived while adding the password. Refreshing, please try again." |
*
* @param {Portal_Passphrase_Error_StaleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_stale = /** @type {((inputs?: Portal_Passphrase_Error_StaleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Error_StaleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_error_stale(inputs)
	return es_portal_passphrase_error_stale(inputs)
});