/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Sms_LabelInputs */

const en_twofa_sms_label = /** @type {(inputs: Twofa_Sms_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text message code`)
};

const es_twofa_sms_label = /** @type {(inputs: Twofa_Sms_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código por mensaje de texto`)
};

/**
* | output |
* | --- |
* | "Text message code" |
*
* @param {Twofa_Sms_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_label = /** @type {((inputs?: Twofa_Sms_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Sms_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_sms_label(inputs)
	return es_twofa_sms_label(inputs)
});