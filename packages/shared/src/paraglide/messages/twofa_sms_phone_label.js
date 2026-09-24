/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Sms_Phone_LabelInputs */

const en_twofa_sms_phone_label = /** @type {(inputs: Twofa_Sms_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number`)
};

const es_twofa_sms_phone_label = /** @type {(inputs: Twofa_Sms_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Número de teléfono`)
};

const en_xa2_twofa_sms_phone_label = /** @type {(inputs: Twofa_Sms_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè nùmbèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Twofa_Sms_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_phone_label = /** @type {((inputs?: Twofa_Sms_Phone_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Sms_Phone_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_sms_phone_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_sms_phone_label(inputs)
	return en_twofa_sms_phone_label(inputs)
});