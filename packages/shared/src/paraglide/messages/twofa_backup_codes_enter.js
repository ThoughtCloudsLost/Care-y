/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_EnterInputs */

const en_twofa_backup_codes_enter = /** @type {(inputs: Twofa_Backup_Codes_EnterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter backup code`)
};

const es_twofa_backup_codes_enter = /** @type {(inputs: Twofa_Backup_Codes_EnterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa código de respaldo`)
};

/**
* | output |
* | --- |
* | "Enter backup code" |
*
* @param {Twofa_Backup_Codes_EnterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_enter = /** @type {((inputs?: Twofa_Backup_Codes_EnterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_EnterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_backup_codes_enter(inputs)
	return es_twofa_backup_codes_enter(inputs)
});