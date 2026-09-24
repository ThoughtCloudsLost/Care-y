/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_Confirm_TitleInputs */

const en_twofa_backup_codes_confirm_title = /** @type {(inputs: Twofa_Backup_Codes_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save your codes`)
};

const es_twofa_backup_codes_confirm_title = /** @type {(inputs: Twofa_Backup_Codes_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guarda tus códigos`)
};

const en_xa2_twofa_backup_codes_confirm_title = /** @type {(inputs: Twofa_Backup_Codes_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè yòùr còdès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Save your codes" |
*
* @param {Twofa_Backup_Codes_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_title = /** @type {((inputs?: Twofa_Backup_Codes_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_confirm_title(inputs)
	return en_twofa_backup_codes_confirm_title(inputs)
});