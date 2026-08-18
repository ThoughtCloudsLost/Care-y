/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Field_Contact_Detail_Phone_LabelInputs */

const en_intake_field_contact_detail_phone_label = /** @type {(inputs: Intake_Field_Contact_Detail_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number`)
};

const es_intake_field_contact_detail_phone_label = /** @type {(inputs: Intake_Field_Contact_Detail_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero de telefono`)
};

/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Intake_Field_Contact_Detail_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_contact_detail_phone_label = /** @type {((inputs?: Intake_Field_Contact_Detail_Phone_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Contact_Detail_Phone_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_field_contact_detail_phone_label(inputs)
	return es_intake_field_contact_detail_phone_label(inputs)
});