/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_EmailInputs */

const en_intake_contact_email = /** @type {(inputs: Intake_Contact_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email me`)
};

const es_intake_contact_email = /** @type {(inputs: Intake_Contact_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo electronico`)
};

/**
* | output |
* | --- |
* | "Email me" |
*
* @param {Intake_Contact_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_email = /** @type {((inputs?: Intake_Contact_EmailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_EmailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_contact_email(inputs)
	return es_intake_contact_email(inputs)
});