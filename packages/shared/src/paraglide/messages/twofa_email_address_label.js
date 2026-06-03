/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Email_Address_LabelInputs */

const en_twofa_email_address_label = /** @type {(inputs: Twofa_Email_Address_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email address`)
};

const es_twofa_email_address_label = /** @type {(inputs: Twofa_Email_Address_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo electrónico`)
};

/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Twofa_Email_Address_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_address_label = /** @type {((inputs?: Twofa_Email_Address_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_Address_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_email_address_label(inputs)
	return es_twofa_email_address_label(inputs)
});