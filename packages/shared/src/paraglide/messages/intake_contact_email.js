/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_EmailInputs */

const en_intake_contact_email = /** @type {(inputs: Intake_Contact_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email me`)
};

const es_intake_contact_email = /** @type {(inputs: Intake_Contact_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo electrónico`)
};

const en_xa2_intake_contact_email = /** @type {(inputs: Intake_Contact_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl mè •••⟧`)
};

/**
* | output |
* | --- |
* | "Email me" |
*
* @param {Intake_Contact_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_contact_email = /** @type {((inputs?: Intake_Contact_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_contact_email(inputs)
	if (locale === "en-XA") return en_xa2_intake_contact_email(inputs)
	return en_intake_contact_email(inputs)
});