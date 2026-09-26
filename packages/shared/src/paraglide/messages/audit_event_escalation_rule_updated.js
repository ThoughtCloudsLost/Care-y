/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Escalation_Rule_UpdatedInputs */

const en_audit_event_escalation_rule_updated = /** @type {(inputs: Audit_Event_Escalation_Rule_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation rule updated`)
};

const es_audit_event_escalation_rule_updated = /** @type {(inputs: Audit_Event_Escalation_Rule_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Regla de escalamiento actualizada`)
};

const en_xa2_audit_event_escalation_rule_updated = /** @type {(inputs: Audit_Event_Escalation_Rule_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn rùlè ùpdàtèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation rule updated" |
*
* @param {Audit_Event_Escalation_Rule_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_escalation_rule_updated = /** @type {((inputs?: Audit_Event_Escalation_Rule_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Escalation_Rule_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_escalation_rule_updated(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_escalation_rule_updated(inputs)
	return en_audit_event_escalation_rule_updated(inputs)
});