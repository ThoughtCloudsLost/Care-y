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

/**
* | output |
* | --- |
* | "Action" |
*
* @param {Escalation_Action_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_action_label = /** @type {((inputs?: Escalation_Action_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Action_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_action_label(inputs)
	return es_escalation_action_label(inputs)
});