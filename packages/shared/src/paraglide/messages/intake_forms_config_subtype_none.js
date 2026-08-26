/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Subtype_NoneInputs */

const en_intake_forms_config_subtype_none = /** @type {(inputs: Intake_Forms_Config_Subtype_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plain text`)
};

const es_intake_forms_config_subtype_none = /** @type {(inputs: Intake_Forms_Config_Subtype_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto simple`)
};

/**
* | output |
* | --- |
* | "Plain text" |
*
* @param {Intake_Forms_Config_Subtype_NoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_subtype_none = /** @type {((inputs?: Intake_Forms_Config_Subtype_NoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Subtype_NoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_subtype_none(inputs)
	return es_intake_forms_config_subtype_none(inputs)
});