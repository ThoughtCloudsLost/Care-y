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

const en_xa2_twofa_backup_codes_enter = /** @type {(inputs: Twofa_Backup_Codes_EnterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr bàckùp còdè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter backup code" |
*
* @param {Twofa_Backup_Codes_EnterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_enter = /** @type {((inputs?: Twofa_Backup_Codes_EnterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_EnterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_backup_codes_enter(inputs)
	if (locale === "en-XA") return en_xa2_twofa_backup_codes_enter(inputs)
	return en_twofa_backup_codes_enter(inputs)
});