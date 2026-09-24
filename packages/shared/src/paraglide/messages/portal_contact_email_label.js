/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Contact_Email_LabelInputs */

const en_portal_contact_email_label = /** @type {(inputs: Portal_Contact_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email`)
};

const es_portal_contact_email_label = /** @type {(inputs: Portal_Contact_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo electrónico`)
};

const en_xa2_portal_contact_email_label = /** @type {(inputs: Portal_Contact_Email_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl ••⟧`)
};

/**
* | output |
* | --- |
* | "Email" |
*
* @param {Portal_Contact_Email_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_contact_email_label = /** @type {((inputs?: Portal_Contact_Email_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Contact_Email_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_contact_email_label(inputs)
	if (locale === "en-XA") return en_xa2_portal_contact_email_label(inputs)
	return en_portal_contact_email_label(inputs)
});