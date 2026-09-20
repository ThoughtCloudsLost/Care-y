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

const en_xa2_intake_forms_config_help_text = /** @type {(inputs: Intake_Forms_Config_Help_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hèlp tèxt •••⟧`)
};

/**
* | output |
* | --- |
* | "Help text" |
*
* @param {Intake_Forms_Config_Help_TextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_help_text = /** @type {((inputs?: Intake_Forms_Config_Help_TextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Help_TextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_help_text(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_help_text(inputs)
	return en_intake_forms_config_help_text(inputs)
});