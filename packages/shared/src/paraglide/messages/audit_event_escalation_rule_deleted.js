/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Escalation_Rule_DeletedInputs */

const en_audit_event_escalation_rule_deleted = /** @type {(inputs: Audit_Event_Escalation_Rule_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation rule deleted`)
};

const es_audit_event_escalation_rule_deleted = /** @type {(inputs: Audit_Event_Escalation_Rule_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Regla de escalamiento eliminada`)
};

const en_xa2_audit_event_escalation_rule_deleted = /** @type {(inputs: Audit_Event_Escalation_Rule_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn rùlè dèlètèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation rule deleted" |
*
* @param {Audit_Event_Escalation_Rule_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_escalation_rule_deleted = /** @type {((inputs?: Audit_Event_Escalation_Rule_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Escalation_Rule_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_escalation_rule_deleted(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_escalation_rule_deleted(inputs)
	return en_audit_event_escalation_rule_deleted(inputs)
});