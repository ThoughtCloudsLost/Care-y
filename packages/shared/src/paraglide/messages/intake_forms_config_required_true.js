/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Required_TrueInputs */

const en_intake_forms_config_required_true = /** @type {(inputs: Intake_Forms_Config_Required_TrueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Must be checked`)
};

const es_intake_forms_config_required_true = /** @type {(inputs: Intake_Forms_Config_Required_TrueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Debe estar marcada`)
};

/**
* | output |
* | --- |
* | "Must be checked" |
*
* @param {Intake_Forms_Config_Required_TrueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_required_true = /** @type {((inputs?: Intake_Forms_Config_Required_TrueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Required_TrueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_required_true(inputs)
	return es_intake_forms_config_required_true(inputs)
});