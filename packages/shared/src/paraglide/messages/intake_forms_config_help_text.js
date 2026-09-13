/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Help_TextInputs */

const en_intake_forms_config_help_text = /** @type {(inputs: Intake_Forms_Config_Help_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Help text`)
};

const es_intake_forms_config_help_text = /** @type {(inputs: Intake_Forms_Config_Help_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto de ayuda`)
};

/**
* | output |
* | --- |
* | "Help text" |
*
* @param {Intake_Forms_Config_Help_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_help_text = /** @type {((inputs?: Intake_Forms_Config_Help_TextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Help_TextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_help_text(inputs)
	return es_intake_forms_config_help_text(inputs)
});