/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Email_Address_PlaceholderInputs */

const en_twofa_email_address_placeholder = /** @type {(inputs: Twofa_Email_Address_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`you@example.com`)
};

const es_twofa_email_address_placeholder = /** @type {(inputs: Twofa_Email_Address_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`tu@ejemplo.com`)
};

/**
* | output |
* | --- |
* | "you@example.com" |
*
* @param {Twofa_Email_Address_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_address_placeholder = /** @type {((inputs?: Twofa_Email_Address_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_Address_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_email_address_placeholder(inputs)
	return es_twofa_email_address_placeholder(inputs)
});