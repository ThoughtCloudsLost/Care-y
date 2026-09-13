/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Remove_OptionInputs */

const en_intake_forms_config_remove_option = /** @type {(inputs: Intake_Forms_Config_Remove_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove option`)
};

const es_intake_forms_config_remove_option = /** @type {(inputs: Intake_Forms_Config_Remove_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar opcion`)
};

/**
* | output |
* | --- |
* | "Remove option" |
*
* @param {Intake_Forms_Config_Remove_OptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_remove_option = /** @type {((inputs?: Intake_Forms_Config_Remove_OptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Remove_OptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_remove_option(inputs)
	return es_intake_forms_config_remove_option(inputs)
});