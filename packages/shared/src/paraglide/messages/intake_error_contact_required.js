/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Contact_RequiredInputs */

const en_intake_error_contact_required = /** @type {(inputs: Intake_Error_Contact_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please enter your contact information.`)
};

const es_intake_error_contact_required = /** @type {(inputs: Intake_Error_Contact_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por favor ingresa tu informacion de contacto.`)
};

/**
* | output |
* | --- |
* | "Please enter your contact information." |
*
* @param {Intake_Error_Contact_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_contact_required = /** @type {((inputs?: Intake_Error_Contact_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Contact_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_contact_required(inputs)
	return es_intake_error_contact_required(inputs)
});