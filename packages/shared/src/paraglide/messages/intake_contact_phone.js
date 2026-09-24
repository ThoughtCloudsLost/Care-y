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

const en_xa2_intake_contact_phone = /** @type {(inputs: Intake_Contact_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèxt òr càll my phònè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Text or call my phone" |
*
* @param {Intake_Contact_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_contact_phone = /** @type {((inputs?: Intake_Contact_PhoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_PhoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_contact_phone(inputs)
	if (locale === "en-XA") return en_xa2_intake_contact_phone(inputs)
	return en_intake_contact_phone(inputs)
});