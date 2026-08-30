/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Sheet_TitleInputs */

const en_portal_correction_sheet_title = /** @type {(inputs: Portal_Correction_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correct my contact info`)
};

const es_portal_correction_sheet_title = /** @type {(inputs: Portal_Correction_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corregir mi información de contacto`)
};

/**
* | output |
* | --- |
* | "Correct my contact info" |
*
* @param {Portal_Correction_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_title = /** @type {((inputs?: Portal_Correction_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_correction_sheet_title(inputs)
	return es_portal_correction_sheet_title(inputs)
});