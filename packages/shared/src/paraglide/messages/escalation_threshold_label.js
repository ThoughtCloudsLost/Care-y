/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Threshold_LabelInputs */

const en_escalation_threshold_label = /** @type {(inputs: Escalation_Threshold_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Threshold`)
};

const es_escalation_threshold_label = /** @type {(inputs: Escalation_Threshold_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Umbral`)
};

const en_xa2_escalation_threshold_label = /** @type {(inputs: Escalation_Threshold_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thrèshòld •••⟧`)
};

/**
* | output |
* | --- |
* | "Threshold" |
*
* @param {Escalation_Threshold_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_threshold_label = /** @type {((inputs?: Escalation_Threshold_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Threshold_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_threshold_label(inputs)
	if (locale === "en-XA") return en_xa2_escalation_threshold_label(inputs)
	return en_escalation_threshold_label(inputs)
});