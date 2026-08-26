/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Subtype_NumberInputs */

const en_intake_forms_config_subtype_number = /** @type {(inputs: Intake_Forms_Config_Subtype_NumberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number`)
};

const es_intake_forms_config_subtype_number = /** @type {(inputs: Intake_Forms_Config_Subtype_NumberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero`)
};

/**
* | output |
* | --- |
* | "Number" |
*
* @param {Intake_Forms_Config_Subtype_NumberInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_subtype_number = /** @type {((inputs?: Intake_Forms_Config_Subtype_NumberInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Subtype_NumberInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_subtype_number(inputs)
	return es_intake_forms_config_subtype_number(inputs)
});