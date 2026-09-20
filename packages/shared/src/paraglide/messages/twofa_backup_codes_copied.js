/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_CopiedInputs */

const en_twofa_backup_codes_copied = /** @type {(inputs: Twofa_Backup_Codes_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Codes copied`)
};

const es_twofa_backup_codes_copied = /** @type {(inputs: Twofa_Backup_Codes_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Códigos copiados`)
};

const en_xa2_twofa_backup_codes_copied = /** @type {(inputs: Twofa_Backup_Codes_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còdès còpìèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Codes copied" |
*
* @param {Twofa_Backup_Codes_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_copied = /** @type {((inputs?: Twofa_Backup_Codes_CopiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_CopiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_copied(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_copied(inputs)
	return en_twofa_backup_codes_copied(inputs)
});