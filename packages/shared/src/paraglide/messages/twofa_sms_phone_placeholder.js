/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Sms_Phone_PlaceholderInputs */

const en_twofa_sms_phone_placeholder = /** @type {(inputs: Twofa_Sms_Phone_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 (555) 000-0000`)
};

const es_twofa_sms_phone_placeholder = /** @type {(inputs: Twofa_Sms_Phone_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 (555) 000-0000`)
};

/**
* | output |
* | --- |
* | "+1 (555) 000-0000" |
*
* @param {Twofa_Sms_Phone_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_phone_placeholder = /** @type {((inputs?: Twofa_Sms_Phone_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Sms_Phone_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_sms_phone_placeholder(inputs)
	return es_twofa_sms_phone_placeholder(inputs)
});