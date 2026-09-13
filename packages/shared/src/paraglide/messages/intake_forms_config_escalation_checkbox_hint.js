/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Escalation_Checkbox_HintInputs */

const en_intake_forms_config_escalation_checkbox_hint = /** @type {(inputs: Intake_Forms_Config_Escalation_Checkbox_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When checked, the form triggers an escalation alert.`)
};

const es_intake_forms_config_escalation_checkbox_hint = /** @type {(inputs: Intake_Forms_Config_Escalation_Checkbox_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando se marca, el formulario activa una alerta de escalamiento.`)
};

/**
* | output |
* | --- |
* | "When checked, the form triggers an escalation alert." |
*
* @param {Intake_Forms_Config_Escalation_Checkbox_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_escalation_checkbox_hint = /** @type {((inputs?: Intake_Forms_Config_Escalation_Checkbox_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Escalation_Checkbox_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_escalation_checkbox_hint(inputs)
	return es_intake_forms_config_escalation_checkbox_hint(inputs)
});