/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Contact_Correction_DescInputs */

const en_followup_type_contact_correction_desc = /** @type {(inputs: Followup_Type_Contact_Correction_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Caller-submitted corrections to their contact information`)
};

const es_followup_type_contact_correction_desc = /** @type {(inputs: Followup_Type_Contact_Correction_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correcciones de información de contacto enviadas por la persona que llamó`)
};

/**
* | output |
* | --- |
* | "Caller-submitted corrections to their contact information" |
*
* @param {Followup_Type_Contact_Correction_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_contact_correction_desc = /** @type {((inputs?: Followup_Type_Contact_Correction_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Contact_Correction_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_contact_correction_desc(inputs)
	return es_followup_type_contact_correction_desc(inputs)
});