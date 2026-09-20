/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Rule_CreatedInputs */

const en_escalation_rule_created = /** @type {(inputs: Escalation_Rule_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation rule created.`)
};

const es_escalation_rule_created = /** @type {(inputs: Escalation_Rule_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Regla de escalamiento creada.`)
};

const en_xa2_escalation_rule_created = /** @type {(inputs: Escalation_Rule_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn rùlè crèàtèd. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation rule created." |
*
* @param {Escalation_Rule_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_rule_created = /** @type {((inputs?: Escalation_Rule_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Rule_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_rule_created(inputs)
	if (locale === "en-XA") return en_xa2_escalation_rule_created(inputs)
	return en_escalation_rule_created(inputs)
});