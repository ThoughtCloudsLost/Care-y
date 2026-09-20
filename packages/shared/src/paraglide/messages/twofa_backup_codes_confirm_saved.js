/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_Confirm_SavedInputs */

const en_twofa_backup_codes_confirm_saved = /** @type {(inputs: Twofa_Backup_Codes_Confirm_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`I saved them`)
};

const es_twofa_backup_codes_confirm_saved = /** @type {(inputs: Twofa_Backup_Codes_Confirm_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los guardé`)
};

const en_xa2_twofa_backup_codes_confirm_saved = /** @type {(inputs: Twofa_Backup_Codes_Confirm_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ì sàvèd thèm ••••⟧`)
};

/**
* | output |
* | --- |
* | "I saved them" |
*
* @param {Twofa_Backup_Codes_Confirm_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_saved = /** @type {((inputs?: Twofa_Backup_Codes_Confirm_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_Confirm_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_confirm_saved(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_confirm_saved(inputs)
	return en_twofa_backup_codes_confirm_saved(inputs)
});