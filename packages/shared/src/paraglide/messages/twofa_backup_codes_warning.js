/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_WarningInputs */

const en_twofa_backup_codes_warning = /** @type {(inputs: Twofa_Backup_Codes_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save these codes. They are shown only once.`)
};

const es_twofa_backup_codes_warning = /** @type {(inputs: Twofa_Backup_Codes_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guarda estos códigos. Solo se muestran una vez.`)
};

/**
* | output |
* | --- |
* | "Save these codes. They are shown only once." |
*
* @param {Twofa_Backup_Codes_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_warning = /** @type {((inputs?: Twofa_Backup_Codes_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_backup_codes_warning(inputs)
	return es_twofa_backup_codes_warning(inputs)
});