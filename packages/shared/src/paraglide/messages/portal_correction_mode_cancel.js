/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Correction_Mode_CancelInputs */

const en_portal_correction_mode_cancel = /** @type {(inputs: Portal_Correction_Mode_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel correction`)
};

const es_portal_correction_mode_cancel = /** @type {(inputs: Portal_Correction_Mode_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelar corrección`)
};

/**
* | output |
* | --- |
* | "Cancel correction" |
*
* @param {Portal_Correction_Mode_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_mode_cancel = /** @type {((inputs?: Portal_Correction_Mode_CancelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Correction_Mode_CancelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_correction_mode_cancel(inputs)
	return es_portal_correction_mode_cancel(inputs)
});