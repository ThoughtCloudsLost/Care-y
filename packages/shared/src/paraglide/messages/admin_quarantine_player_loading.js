/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Player_LoadingInputs */

const en_admin_quarantine_player_loading = /** @type {(inputs: Admin_Quarantine_Player_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decrypting audio...`)
};

const es_admin_quarantine_player_loading = /** @type {(inputs: Admin_Quarantine_Player_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descifrando audio...`)
};

/**
* | output |
* | --- |
* | "Decrypting audio..." |
*
* @param {Admin_Quarantine_Player_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_player_loading = /** @type {((inputs?: Admin_Quarantine_Player_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Player_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_player_loading(inputs)
	return es_admin_quarantine_player_loading(inputs)
});