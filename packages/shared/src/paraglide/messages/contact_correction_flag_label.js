/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Contact_Correction_Flag_LabelInputs */

const en_contact_correction_flag_label = /** @type {(inputs: Contact_Correction_Flag_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contact correction, verify before contacting`)
};

const es_contact_correction_flag_label = /** @type {(inputs: Contact_Correction_Flag_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corrección de contacto, verifica antes de contactar`)
};

/**
* | output |
* | --- |
* | "Contact correction, verify before contacting" |
*
* @param {Contact_Correction_Flag_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const contact_correction_flag_label = /** @type {((inputs?: Contact_Correction_Flag_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Correction_Flag_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_contact_correction_flag_label(inputs)
	return es_contact_correction_flag_label(inputs)
});