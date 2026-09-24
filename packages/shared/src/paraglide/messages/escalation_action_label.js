/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Action_LabelInputs */

const en_escalation_action_label = /** @type {(inputs: Escalation_Action_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Action`)
};

const es_escalation_action_label = /** @type {(inputs: Escalation_Action_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acción`)
};

const en_xa2_escalation_action_label = /** @type {(inputs: Escalation_Action_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìòn ••⟧`)
};

/**
* | output |
* | --- |
* | "Action" |
*
* @param {Escalation_Action_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_action_label = /** @type {((inputs?: Escalation_Action_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Action_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_action_label(inputs)
	if (locale === "en-XA") return en_xa2_escalation_action_label(inputs)
	return en_escalation_action_label(inputs)
});