/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Role_EscalationInputs */

const en_intake_forms_config_role_escalation = /** @type {(inputs: Intake_Forms_Config_Role_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation`)
};

const es_intake_forms_config_role_escalation = /** @type {(inputs: Intake_Forms_Config_Role_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalamiento`)
};

const en_xa2_intake_forms_config_role_escalation = /** @type {(inputs: Intake_Forms_Config_Role_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation" |
*
* @param {Intake_Forms_Config_Role_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_escalation = /** @type {((inputs?: Intake_Forms_Config_Role_EscalationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Role_EscalationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_role_escalation(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_role_escalation(inputs)
	return en_intake_forms_config_role_escalation(inputs)
});