/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Escalation_Alert_LabelInputs */

const en_intake_forms_config_escalation_alert_label = /** @type {(inputs: Intake_Forms_Config_Escalation_Alert_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alert level`)
};

const es_intake_forms_config_escalation_alert_label = /** @type {(inputs: Intake_Forms_Config_Escalation_Alert_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nivel de alerta`)
};

const en_xa2_intake_forms_config_escalation_alert_label = /** @type {(inputs: Intake_Forms_Config_Escalation_Alert_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àlèrt lèvèl ••••⟧`)
};

/**
* | output |
* | --- |
* | "Alert level" |
*
* @param {Intake_Forms_Config_Escalation_Alert_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_escalation_alert_label = /** @type {((inputs?: Intake_Forms_Config_Escalation_Alert_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Escalation_Alert_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_escalation_alert_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_escalation_alert_label(inputs)
	return en_intake_forms_config_escalation_alert_label(inputs)
});