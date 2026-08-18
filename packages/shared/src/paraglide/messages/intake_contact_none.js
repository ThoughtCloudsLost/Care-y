/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_NoneInputs */

const en_intake_contact_none = /** @type {(inputs: Intake_Contact_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`I'll check back myself`)
};

const es_intake_contact_none = /** @type {(inputs: Intake_Contact_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volvere a consultar por mi cuenta`)
};

/**
* | output |
* | --- |
* | "I'll check back myself" |
*
* @param {Intake_Contact_NoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_none = /** @type {((inputs?: Intake_Contact_NoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_NoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_contact_none(inputs)
	return es_intake_contact_none(inputs)
});