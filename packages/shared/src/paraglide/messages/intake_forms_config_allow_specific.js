/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Allow_SpecificInputs */

const en_intake_forms_config_allow_specific = /** @type {(inputs: Intake_Forms_Config_Allow_SpecificInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Allow specific dates`)
};

const es_intake_forms_config_allow_specific = /** @type {(inputs: Intake_Forms_Config_Allow_SpecificInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permitir fechas especificas`)
};

/**
* | output |
* | --- |
* | "Allow specific dates" |
*
* @param {Intake_Forms_Config_Allow_SpecificInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_allow_specific = /** @type {((inputs?: Intake_Forms_Config_Allow_SpecificInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Allow_SpecificInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_allow_specific(inputs)
	return es_intake_forms_config_allow_specific(inputs)
});