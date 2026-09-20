/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Twofa_Backup_Codes_RemainingInputs */

const en_twofa_backup_codes_remaining = /** @type {(inputs: Twofa_Backup_Codes_RemainingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} backup codes remaining`)
};

const es_twofa_backup_codes_remaining = /** @type {(inputs: Twofa_Backup_Codes_RemainingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} códigos de respaldo restantes`)
};

const en_xa2_twofa_backup_codes_remaining = /** @type {(inputs: Twofa_Backup_Codes_RemainingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} bàckùp còdès rèmàìnìng •••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} backup codes remaining" |
*
* @param {Twofa_Backup_Codes_RemainingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_remaining = /** @type {((inputs: Twofa_Backup_Codes_RemainingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_RemainingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_remaining(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_remaining(inputs)
	return en_twofa_backup_codes_remaining(inputs)
});