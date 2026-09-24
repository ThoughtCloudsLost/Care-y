/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Escalation_Rule_DeletedInputs */

const en_escalation_rule_deleted = /** @type {(inputs: Escalation_Rule_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation rule deleted.`)
};

const es_escalation_rule_deleted = /** @type {(inputs: Escalation_Rule_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Regla de escalamiento eliminada.`)
};

const en_xa2_escalation_rule_deleted = /** @type {(inputs: Escalation_Rule_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn rùlè dèlètèd. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation rule deleted." |
*
* @param {Escalation_Rule_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_rule_deleted = /** @type {((inputs?: Escalation_Rule_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Escalation_Rule_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_escalation_rule_deleted(inputs)
	if (locale === "en-XA") return en_xa2_escalation_rule_deleted(inputs)
	return en_escalation_rule_deleted(inputs)
});