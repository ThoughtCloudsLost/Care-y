/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Condition_LabelInputs */

const en_escalation_condition_label = /** @type {(inputs: Escalation_Condition_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Condition`)
};

const es_escalation_condition_label = /** @type {(inputs: Escalation_Condition_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Condición`)
};

const en_xa2_escalation_condition_label = /** @type {(inputs: Escalation_Condition_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còndìtìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Condition" |
*
* @param {Escalation_Condition_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_label = /** @type {((inputs?: Escalation_Condition_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Condition_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_condition_label(inputs)
	if (locale === "en-XA") return en_xa2_escalation_condition_label(inputs)
	return en_escalation_condition_label(inputs)
});