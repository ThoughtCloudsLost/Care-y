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

const en_xa2_twofa_sms_label = /** @type {(inputs: Twofa_Sms_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèxt mèssàgè còdè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Text message code" |
*
* @param {Twofa_Sms_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_label = /** @type {((inputs?: Twofa_Sms_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Sms_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_sms_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_sms_label(inputs)
	return en_twofa_sms_label(inputs)
});