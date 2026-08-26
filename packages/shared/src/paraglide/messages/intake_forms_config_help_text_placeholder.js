/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Help_Text_PlaceholderInputs */

const en_intake_forms_config_help_text_placeholder = /** @type {(inputs: Intake_Forms_Config_Help_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. We will only use this to contact you.`)
};

const es_intake_forms_config_help_text_placeholder = /** @type {(inputs: Intake_Forms_Config_Help_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`p. ej. Solo usaremos esto para contactarte.`)
};

/**
* | output |
* | --- |
* | "e.g. We will only use this to contact you." |
*
* @param {Intake_Forms_Config_Help_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_help_text_placeholder = /** @type {((inputs?: Intake_Forms_Config_Help_Text_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Help_Text_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_help_text_placeholder(inputs)
	return es_intake_forms_config_help_text_placeholder(inputs)
});