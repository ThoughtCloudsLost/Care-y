/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Contact_Correction_HandledInputs */

const en_contact_correction_handled = /** @type {(inputs: Contact_Correction_HandledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Handled`)
};

const es_contact_correction_handled = /** @type {(inputs: Contact_Correction_HandledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Atendido`)
};

/**
* | output |
* | --- |
* | "Handled" |
*
* @param {Contact_Correction_HandledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const contact_correction_handled = /** @type {((inputs?: Contact_Correction_HandledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Correction_HandledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_contact_correction_handled(inputs)
	return es_contact_correction_handled(inputs)
});