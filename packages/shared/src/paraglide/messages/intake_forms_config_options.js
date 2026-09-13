/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_OptionsInputs */

const en_intake_forms_config_options = /** @type {(inputs: Intake_Forms_Config_OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Options`)
};

const es_intake_forms_config_options = /** @type {(inputs: Intake_Forms_Config_OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opciones`)
};

/**
* | output |
* | --- |
* | "Options" |
*
* @param {Intake_Forms_Config_OptionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_options = /** @type {((inputs?: Intake_Forms_Config_OptionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_OptionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_options(inputs)
	return es_intake_forms_config_options(inputs)
});