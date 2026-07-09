/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Backup_Codes_Confirm_TextInputs */

const en_twofa_backup_codes_confirm_text = /** @type {(inputs: Twofa_Backup_Codes_Confirm_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`These codes will not be shown again. Make sure you copied or wrote them down.`)
};

const es_twofa_backup_codes_confirm_text = /** @type {(inputs: Twofa_Backup_Codes_Confirm_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estos códigos no se mostrarán de nuevo. Asegúrate de haberlos copiado o anotado.`)
};

/**
* | output |
* | --- |
* | "These codes will not be shown again. Make sure you copied or wrote them down." |
*
* @param {Twofa_Backup_Codes_Confirm_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_text = /** @type {((inputs?: Twofa_Backup_Codes_Confirm_TextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Backup_Codes_Confirm_TextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_backup_codes_confirm_text(inputs)
	return es_twofa_backup_codes_confirm_text(inputs)
});