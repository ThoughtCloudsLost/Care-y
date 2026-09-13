/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Rule_UpdatedInputs */

const en_escalation_rule_updated = /** @type {(inputs: Escalation_Rule_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation rule updated.`)
};

const es_escalation_rule_updated = /** @type {(inputs: Escalation_Rule_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Regla de escalamiento actualizada.`)
};

/**
* | output |
* | --- |
* | "Escalation rule updated." |
*
* @param {Escalation_Rule_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_rule_updated = /** @type {((inputs?: Escalation_Rule_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Rule_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_escalation_rule_updated(inputs)
	return es_escalation_rule_updated(inputs)
});