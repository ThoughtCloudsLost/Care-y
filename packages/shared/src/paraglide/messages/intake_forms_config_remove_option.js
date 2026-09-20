/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Remove_OptionInputs */

const en_intake_forms_config_remove_option = /** @type {(inputs: Intake_Forms_Config_Remove_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove option`)
};

const es_intake_forms_config_remove_option = /** @type {(inputs: Intake_Forms_Config_Remove_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar opción`)
};

const en_xa2_intake_forms_config_remove_option = /** @type {(inputs: Intake_Forms_Config_Remove_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè òptìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove option" |
*
* @param {Intake_Forms_Config_Remove_OptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_remove_option = /** @type {((inputs?: Intake_Forms_Config_Remove_OptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Remove_OptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_remove_option(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_remove_option(inputs)
	return en_intake_forms_config_remove_option(inputs)
});