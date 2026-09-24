/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Add_RuleInputs */

const en_escalation_add_rule = /** @type {(inputs: Escalation_Add_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+ Add rule`)
};

const es_escalation_add_rule = /** @type {(inputs: Escalation_Add_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+ Agregar regla`)
};

const en_xa2_escalation_add_rule = /** @type {(inputs: Escalation_Add_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦+ Àdd rùlè •••⟧`)
};

/**
* | output |
* | --- |
* | "+ Add rule" |
*
* @param {Escalation_Add_RuleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_add_rule = /** @type {((inputs?: Escalation_Add_RuleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Add_RuleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_add_rule(inputs)
	if (locale === "en-XA") return en_xa2_escalation_add_rule(inputs)
	return en_escalation_add_rule(inputs)
});