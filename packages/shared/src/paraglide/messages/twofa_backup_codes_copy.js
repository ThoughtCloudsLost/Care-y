/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_CopyInputs */

const en_twofa_backup_codes_copy = /** @type {(inputs: Twofa_Backup_Codes_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy all codes`)
};

const es_twofa_backup_codes_copy = /** @type {(inputs: Twofa_Backup_Codes_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar todos los códigos`)
};

/**
* | output |
* | --- |
* | "Copy all codes" |
*
* @param {Twofa_Backup_Codes_CopyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_copy = /** @type {((inputs?: Twofa_Backup_Codes_CopyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_CopyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_backup_codes_copy(inputs)
	return es_twofa_backup_codes_copy(inputs)
});