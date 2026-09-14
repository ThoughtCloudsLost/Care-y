/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Sheet_SubmitInputs */

const en_portal_correction_sheet_submit = /** @type {(inputs: Portal_Correction_Sheet_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send correction`)
};

const es_portal_correction_sheet_submit = /** @type {(inputs: Portal_Correction_Sheet_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar corrección`)
};

/**
* | output |
* | --- |
* | "Send correction" |
*
* @param {Portal_Correction_Sheet_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_submit = /** @type {((inputs?: Portal_Correction_Sheet_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Sheet_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_correction_sheet_submit(inputs)
	return en_portal_correction_sheet_submit(inputs)
});