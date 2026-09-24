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

const en_xa2_twofa_email_address_label = /** @type {(inputs: Twofa_Email_Address_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl àddrèss ••••⟧`)
};

/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Twofa_Email_Address_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_email_address_label = /** @type {((inputs?: Twofa_Email_Address_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_Address_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_email_address_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_email_address_label(inputs)
	return en_twofa_email_address_label(inputs)
});