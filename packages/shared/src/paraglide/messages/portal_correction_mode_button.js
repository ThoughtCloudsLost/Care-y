/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Mode_ButtonInputs */

const en_portal_correction_mode_button = /** @type {(inputs: Portal_Correction_Mode_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correct my contact info`)
};

const es_portal_correction_mode_button = /** @type {(inputs: Portal_Correction_Mode_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corregir mi información de contacto`)
};

/**
* | output |
* | --- |
* | "Correct my contact info" |
*
* @param {Portal_Correction_Mode_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_mode_button = /** @type {((inputs?: Portal_Correction_Mode_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Mode_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_correction_mode_button(inputs)
	return es_portal_correction_mode_button(inputs)
});