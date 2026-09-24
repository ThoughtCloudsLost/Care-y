/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Backup_CodesInputs */

const en_error_no_backup_codes = /** @type {(inputs: Error_No_Backup_CodesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No backup codes available.`)
};

const es_error_no_backup_codes = /** @type {(inputs: Error_No_Backup_CodesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay códigos de respaldo disponibles.`)
};

const en_xa2_error_no_backup_codes = /** @type {(inputs: Error_No_Backup_CodesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò bàckùp còdès àvàìlàblè. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No backup codes available." |
*
* @param {Error_No_Backup_CodesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_no_backup_codes = /** @type {((inputs?: Error_No_Backup_CodesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Backup_CodesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_no_backup_codes(inputs)
	if (locale === "en-XA") return en_xa2_error_no_backup_codes(inputs)
	return en_error_no_backup_codes(inputs)
});