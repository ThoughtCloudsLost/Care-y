/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Contact_Correction_Handled_ByInputs */

const en_contact_correction_handled_by = /** @type {(inputs: Contact_Correction_Handled_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Handled by ${i?.name}`)
};

const es_contact_correction_handled_by = /** @type {(inputs: Contact_Correction_Handled_ByInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Atendido por ${i?.name}`)
};

/**
* | output |
* | --- |
* | "Handled by {name}" |
*
* @param {Contact_Correction_Handled_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const contact_correction_handled_by = /** @type {((inputs: Contact_Correction_Handled_ByInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Correction_Handled_ByInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_contact_correction_handled_by(inputs)
	return es_contact_correction_handled_by(inputs)
});