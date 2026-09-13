/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Contact_Correction_Mark_HandledInputs */

const en_contact_correction_mark_handled = /** @type {(inputs: Contact_Correction_Mark_HandledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mark handled`)
};

const es_contact_correction_mark_handled = /** @type {(inputs: Contact_Correction_Mark_HandledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marcar como atendido`)
};

/**
* | output |
* | --- |
* | "Mark handled" |
*
* @param {Contact_Correction_Mark_HandledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const contact_correction_mark_handled = /** @type {((inputs?: Contact_Correction_Mark_HandledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Contact_Correction_Mark_HandledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_contact_correction_mark_handled(inputs)
	return es_contact_correction_mark_handled(inputs)
});