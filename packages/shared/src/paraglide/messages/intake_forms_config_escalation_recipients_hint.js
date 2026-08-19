/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Escalation_Recipients_HintInputs */

const en_intake_forms_config_escalation_recipients_hint = /** @type {(inputs: Intake_Forms_Config_Escalation_Recipients_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose volunteers to notify when escalation triggers.`)
};

const es_intake_forms_config_escalation_recipients_hint = /** @type {(inputs: Intake_Forms_Config_Escalation_Recipients_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elija voluntarios para notificar cuando se active un escalamiento.`)
};

/**
* | output |
* | --- |
* | "Choose volunteers to notify when escalation triggers." |
*
* @param {Intake_Forms_Config_Escalation_Recipients_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_escalation_recipients_hint = /** @type {((inputs?: Intake_Forms_Config_Escalation_Recipients_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Escalation_Recipients_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_escalation_recipients_hint(inputs)
	return es_intake_forms_config_escalation_recipients_hint(inputs)
});