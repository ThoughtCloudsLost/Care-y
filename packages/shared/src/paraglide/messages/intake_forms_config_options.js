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

const en_xa2_intake_forms_config_options = /** @type {(inputs: Intake_Forms_Config_OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òptìòns •••⟧`)
};

/**
* | output |
* | --- |
* | "Options" |
*
* @param {Intake_Forms_Config_OptionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_options = /** @type {((inputs?: Intake_Forms_Config_OptionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_OptionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_options(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_options(inputs)
	return en_intake_forms_config_options(inputs)
});