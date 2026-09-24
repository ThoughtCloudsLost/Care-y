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

const en_xa2_twofa_backup_codes_warning = /** @type {(inputs: Twofa_Backup_Codes_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè thèsè còdès. Thèy àrè shòwn ònly òncè. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Save these codes. They are shown only once." |
*
* @param {Twofa_Backup_Codes_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_warning = /** @type {((inputs?: Twofa_Backup_Codes_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_warning(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_warning(inputs)
	return en_twofa_backup_codes_warning(inputs)
});