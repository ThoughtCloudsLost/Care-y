/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_TitleInputs */

const en_twofa_backup_codes_title = /** @type {(inputs: Twofa_Backup_Codes_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Backup codes`)
};

const es_twofa_backup_codes_title = /** @type {(inputs: Twofa_Backup_Codes_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Códigos de respaldo`)
};

/**
* | output |
* | --- |
* | "Backup codes" |
*
* @param {Twofa_Backup_Codes_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_title = /** @type {((inputs?: Twofa_Backup_Codes_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_backup_codes_title(inputs)
	return es_twofa_backup_codes_title(inputs)
});