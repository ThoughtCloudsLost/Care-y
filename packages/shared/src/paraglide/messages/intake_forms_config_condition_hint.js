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

/**
* | output |
* | --- |
* | "When set, this field only appears if the selected conditions are met." |
*
* @param {Intake_Forms_Config_Condition_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_hint = /** @type {((inputs?: Intake_Forms_Config_Condition_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_condition_hint(inputs)
	return es_intake_forms_config_condition_hint(inputs)
});