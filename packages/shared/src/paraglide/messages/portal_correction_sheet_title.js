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

const en_xa2_portal_correction_sheet_title = /** @type {(inputs: Portal_Correction_Sheet_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còrrèct my còntàct ìnfò •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Correct my contact info" |
*
* @param {Portal_Correction_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_title = /** @type {((inputs?: Portal_Correction_Sheet_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Sheet_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_correction_sheet_title(inputs)
	if (locale === "en-XA") return en_xa2_portal_correction_sheet_title(inputs)
	return en_portal_correction_sheet_title(inputs)
});