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

const en_xa2_portal_passphrase_error_stale = /** @type {(inputs: Portal_Passphrase_Error_StaleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw mèssàgès àrrìvèd whìlè àddìng thè pàsswòrd. Rèfrèshìng, plèàsè try àgàìn. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "New messages arrived while adding the password. Refreshing, please try again." |
*
* @param {Portal_Passphrase_Error_StaleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_error_stale = /** @type {((inputs?: Portal_Passphrase_Error_StaleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Error_StaleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_error_stale(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_error_stale(inputs)
	return en_portal_passphrase_error_stale(inputs)
});