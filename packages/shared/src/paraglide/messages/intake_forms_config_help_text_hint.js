/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Help_Text_HintInputs */

const en_intake_forms_config_help_text_hint = /** @type {(inputs: Intake_Forms_Config_Help_Text_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown below the field on the public form.`)
};

const es_intake_forms_config_help_text_hint = /** @type {(inputs: Intake_Forms_Config_Help_Text_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra debajo del campo en el formulario publico.`)
};

/**
* | output |
* | --- |
* | "Shown below the field on the public form." |
*
* @param {Intake_Forms_Config_Help_Text_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_help_text_hint = /** @type {((inputs?: Intake_Forms_Config_Help_Text_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Help_Text_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_help_text_hint(inputs)
	return es_intake_forms_config_help_text_hint(inputs)
});