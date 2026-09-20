/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Add_OptionInputs */

const en_intake_forms_config_add_option = /** @type {(inputs: Intake_Forms_Config_Add_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add option`)
};

const es_intake_forms_config_add_option = /** @type {(inputs: Intake_Forms_Config_Add_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar opción`)
};

const en_xa2_intake_forms_config_add_option = /** @type {(inputs: Intake_Forms_Config_Add_OptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd òptìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Add option" |
*
* @param {Intake_Forms_Config_Add_OptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_add_option = /** @type {((inputs?: Intake_Forms_Config_Add_OptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Add_OptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_add_option(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_add_option(inputs)
	return en_intake_forms_config_add_option(inputs)
});