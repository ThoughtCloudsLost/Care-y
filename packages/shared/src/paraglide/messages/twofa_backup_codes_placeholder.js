/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_PlaceholderInputs */

const en_twofa_backup_codes_placeholder = /** @type {(inputs: Twofa_Backup_Codes_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`xxxxxxxx`)
};

const es_twofa_backup_codes_placeholder = /** @type {(inputs: Twofa_Backup_Codes_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`xxxxxxxx`)
};

/**
* | output |
* | --- |
* | "xxxxxxxx" |
*
* @param {Twofa_Backup_Codes_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_placeholder = /** @type {((inputs?: Twofa_Backup_Codes_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_backup_codes_placeholder(inputs)
	return es_twofa_backup_codes_placeholder(inputs)
});