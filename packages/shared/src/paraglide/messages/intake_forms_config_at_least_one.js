/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_At_Least_OneInputs */

const en_intake_forms_config_at_least_one = /** @type {(inputs: Intake_Forms_Config_At_Least_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`At least one window type must be allowed.`)
};

const es_intake_forms_config_at_least_one = /** @type {(inputs: Intake_Forms_Config_At_Least_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se debe permitir al menos un tipo de horario.`)
};

/**
* | output |
* | --- |
* | "At least one window type must be allowed." |
*
* @param {Intake_Forms_Config_At_Least_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_at_least_one = /** @type {((inputs?: Intake_Forms_Config_At_Least_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_At_Least_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_at_least_one(inputs)
	return es_intake_forms_config_at_least_one(inputs)
});