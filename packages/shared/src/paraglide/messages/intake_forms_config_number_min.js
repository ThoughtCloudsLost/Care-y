/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Number_MinInputs */

const en_intake_forms_config_number_min = /** @type {(inputs: Intake_Forms_Config_Number_MinInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimum value`)
};

const es_intake_forms_config_number_min = /** @type {(inputs: Intake_Forms_Config_Number_MinInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Valor minimo`)
};

/**
* | output |
* | --- |
* | "Minimum value" |
*
* @param {Intake_Forms_Config_Number_MinInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_number_min = /** @type {((inputs?: Intake_Forms_Config_Number_MinInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Number_MinInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_number_min(inputs)
	return es_intake_forms_config_number_min(inputs)
});