/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_RegeneratedInputs */

const en_twofa_backup_codes_regenerated = /** @type {(inputs: Twofa_Backup_Codes_RegeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your previous backup codes are now invalid.`)
};

const es_twofa_backup_codes_regenerated = /** @type {(inputs: Twofa_Backup_Codes_RegeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus códigos de respaldo anteriores ya no son válidos.`)
};

const en_xa2_twofa_backup_codes_regenerated = /** @type {(inputs: Twofa_Backup_Codes_RegeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr prèvìòùs bàckùp còdès àrè nòw ìnvàlìd. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your previous backup codes are now invalid." |
*
* @param {Twofa_Backup_Codes_RegeneratedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_regenerated = /** @type {((inputs?: Twofa_Backup_Codes_RegeneratedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_RegeneratedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_regenerated(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_regenerated(inputs)
	return en_twofa_backup_codes_regenerated(inputs)
});