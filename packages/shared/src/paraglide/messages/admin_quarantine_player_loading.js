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

const en_xa2_admin_quarantine_player_loading = /** @type {(inputs: Admin_Quarantine_Player_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dècryptìng àùdìò... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Decrypting audio..." |
*
* @param {Admin_Quarantine_Player_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_player_loading = /** @type {((inputs?: Admin_Quarantine_Player_LoadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Player_LoadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_player_loading(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_player_loading(inputs)
	return en_admin_quarantine_player_loading(inputs)
});