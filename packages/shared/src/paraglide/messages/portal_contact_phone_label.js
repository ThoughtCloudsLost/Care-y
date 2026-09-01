/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Contact_Phone_LabelInputs */

const en_portal_contact_phone_label = /** @type {(inputs: Portal_Contact_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone`)
};

const es_portal_contact_phone_label = /** @type {(inputs: Portal_Contact_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Teléfono`)
};

/**
* | output |
* | --- |
* | "Phone" |
*
* @param {Portal_Contact_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_phone_label = /** @type {((inputs?: Portal_Contact_Phone_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Contact_Phone_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_contact_phone_label(inputs)
	return es_portal_contact_phone_label(inputs)
});