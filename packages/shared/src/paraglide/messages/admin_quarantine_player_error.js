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

const en_xa2_admin_quarantine_player_error = /** @type {(inputs: Admin_Quarantine_Player_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt lòàd vòìcèmàìl àùdìò •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not load voicemail audio" |
*
* @param {Admin_Quarantine_Player_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_player_error = /** @type {((inputs?: Admin_Quarantine_Player_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Player_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_player_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_player_error(inputs)
	return en_admin_quarantine_player_error(inputs)
});