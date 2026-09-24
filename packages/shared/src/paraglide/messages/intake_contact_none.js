/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Contact_NoneInputs */

const en_intake_contact_none = /** @type {(inputs: Intake_Contact_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`I'll check back myself`)
};

const es_intake_contact_none = /** @type {(inputs: Intake_Contact_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volveré a consultar por mi cuenta`)
};

const en_xa2_intake_contact_none = /** @type {(inputs: Intake_Contact_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ì'll chèck bàck mysèlf •••••••⟧`)
};

/**
* | output |
* | --- |
* | "I'll check back myself" |
*
* @param {Intake_Contact_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_contact_none = /** @type {((inputs?: Intake_Contact_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Contact_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_contact_none(inputs)
	if (locale === "en-XA") return en_xa2_intake_contact_none(inputs)
	return en_intake_contact_none(inputs)
});