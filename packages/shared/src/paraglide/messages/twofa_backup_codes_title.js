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

const en_xa2_twofa_backup_codes_title = /** @type {(inputs: Twofa_Backup_Codes_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàckùp còdès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Backup codes" |
*
* @param {Twofa_Backup_Codes_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_title = /** @type {((inputs?: Twofa_Backup_Codes_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_title(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_title(inputs)
	return en_twofa_backup_codes_title(inputs)
});