/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Mode_LabelInputs */

const en_portal_correction_mode_label = /** @type {(inputs: Portal_Correction_Mode_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correcting contact info`)
};

const es_portal_correction_mode_label = /** @type {(inputs: Portal_Correction_Mode_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corrigiendo información de contacto`)
};

/**
* | output |
* | --- |
* | "Correcting contact info" |
*
* @param {Portal_Correction_Mode_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_mode_label = /** @type {((inputs?: Portal_Correction_Mode_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Mode_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_correction_mode_label(inputs)
	return es_portal_correction_mode_label(inputs)
});