/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Field_Contact_Detail_Email_LabelInputs */

const en_intake_field_contact_detail_email_label = /** @type {(inputs: Intake_Field_Contact_Detail_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email address`)
};

const es_intake_field_contact_detail_email_label = /** @type {(inputs: Intake_Field_Contact_Detail_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo electrónico`)
};

const en_xa2_intake_field_contact_detail_email_label = /** @type {(inputs: Intake_Field_Contact_Detail_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl àddrèss ••••⟧`)
};

/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Intake_Field_Contact_Detail_Email_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_field_contact_detail_email_label = /** @type {((inputs?: Intake_Field_Contact_Detail_Email_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Field_Contact_Detail_Email_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_field_contact_detail_email_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_field_contact_detail_email_label(inputs)
	return en_intake_field_contact_detail_email_label(inputs)
});