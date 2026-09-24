/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_Contact_RequiredInputs */

const en_intake_error_contact_required = /** @type {(inputs: Intake_Error_Contact_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please enter your contact information.`)
};

const es_intake_error_contact_required = /** @type {(inputs: Intake_Error_Contact_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por favor ingresa tu información de contacto.`)
};

const en_xa2_intake_error_contact_required = /** @type {(inputs: Intake_Error_Contact_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plèàsè èntèr yòùr còntàct ìnfòrmàtìòn. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Please enter your contact information." |
*
* @param {Intake_Error_Contact_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_error_contact_required = /** @type {((inputs?: Intake_Error_Contact_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Contact_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_error_contact_required(inputs)
	if (locale === "en-XA") return en_xa2_intake_error_contact_required(inputs)
	return en_intake_error_contact_required(inputs)
});