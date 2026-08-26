/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Contact_CorrectionInputs */

const en_followup_type_contact_correction = /** @type {(inputs: Followup_Type_Contact_CorrectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contact correction`)
};

const es_followup_type_contact_correction = /** @type {(inputs: Followup_Type_Contact_CorrectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corrección de contacto`)
};

/**
* | output |
* | --- |
* | "Contact correction" |
*
* @param {Followup_Type_Contact_CorrectionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_contact_correction = /** @type {((inputs?: Followup_Type_Contact_CorrectionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Contact_CorrectionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_contact_correction(inputs)
	return es_followup_type_contact_correction(inputs)
});