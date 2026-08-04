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

/**
* | output |
* | --- |
* | "Condition" |
*
* @param {Escalation_Condition_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_condition_label = /** @type {((inputs?: Escalation_Condition_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Condition_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_condition_label(inputs)
	return es_escalation_condition_label(inputs)
});