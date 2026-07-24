/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_Confirm_BackInputs */

const en_twofa_backup_codes_confirm_back = /** @type {(inputs: Twofa_Backup_Codes_Confirm_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go back`)
};

const es_twofa_backup_codes_confirm_back = /** @type {(inputs: Twofa_Backup_Codes_Confirm_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver`)
};

/**
* | output |
* | --- |
* | "Go back" |
*
* @param {Twofa_Backup_Codes_Confirm_BackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_back = /** @type {((inputs?: Twofa_Backup_Codes_Confirm_BackInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_Confirm_BackInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_backup_codes_confirm_back(inputs)
	return es_twofa_backup_codes_confirm_back(inputs)
});