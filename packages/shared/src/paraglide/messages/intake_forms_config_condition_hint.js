/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_HintInputs */

const en_intake_forms_config_condition_hint = /** @type {(inputs: Intake_Forms_Config_Condition_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When set, this field only appears if the selected conditions are met.`)
};

const es_intake_forms_config_condition_hint = /** @type {(inputs: Intake_Forms_Config_Condition_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando se configura, este campo solo aparece si se cumplen las condiciones seleccionadas.`)
};

const en_xa2_intake_forms_config_condition_hint = /** @type {(inputs: Intake_Forms_Config_Condition_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn sèt, thìs fìèld ònly àppèàrs ìf thè sèlèctèd còndìtìòns àrè mèt. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When set, this field only appears if the selected conditions are met." |
*
* @param {Intake_Forms_Config_Condition_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_hint = /** @type {((inputs?: Intake_Forms_Config_Condition_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_hint(inputs)
	return en_intake_forms_config_condition_hint(inputs)
});