/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_PhoneInputs */

const en_intake_contact_phone = /** @type {(inputs: Intake_Contact_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text or call my phone`)
};

const es_intake_contact_phone = /** @type {(inputs: Intake_Contact_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamada o mensaje de texto`)
};

/**
* | output |
* | --- |
* | "Text or call my phone" |
*
* @param {Intake_Contact_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_phone = /** @type {((inputs?: Intake_Contact_PhoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_PhoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_contact_phone(inputs)
	return es_intake_contact_phone(inputs)
});