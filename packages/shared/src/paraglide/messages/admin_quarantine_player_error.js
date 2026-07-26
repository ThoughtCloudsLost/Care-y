/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Player_ErrorInputs */

const en_admin_quarantine_player_error = /** @type {(inputs: Admin_Quarantine_Player_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not load voicemail audio`)
};

const es_admin_quarantine_player_error = /** @type {(inputs: Admin_Quarantine_Player_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo cargar el audio del correo de voz`)
};

/**
* | output |
* | --- |
* | "Could not load voicemail audio" |
*
* @param {Admin_Quarantine_Player_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_player_error = /** @type {((inputs?: Admin_Quarantine_Player_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Player_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_player_error(inputs)
	return es_admin_quarantine_player_error(inputs)
});