/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_SubtypeInputs */

const en_intake_forms_config_subtype = /** @type {(inputs: Intake_Forms_Config_SubtypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Input type`)
};

const es_intake_forms_config_subtype = /** @type {(inputs: Intake_Forms_Config_SubtypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de entrada`)
};

/**
* | output |
* | --- |
* | "Input type" |
*
* @param {Intake_Forms_Config_SubtypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_subtype = /** @type {((inputs?: Intake_Forms_Config_SubtypeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_SubtypeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_subtype(inputs)
	return es_intake_forms_config_subtype(inputs)
});