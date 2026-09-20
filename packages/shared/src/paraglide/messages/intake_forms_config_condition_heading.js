/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Condition_HeadingInputs */

const en_intake_forms_config_condition_heading = /** @type {(inputs: Intake_Forms_Config_Condition_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Visibility condition`)
};

const es_intake_forms_config_condition_heading = /** @type {(inputs: Intake_Forms_Config_Condition_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Condición de visibilidad`)
};

const en_xa2_intake_forms_config_condition_heading = /** @type {(inputs: Intake_Forms_Config_Condition_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìsìbìlìty còndìtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Visibility condition" |
*
* @param {Intake_Forms_Config_Condition_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_heading = /** @type {((inputs?: Intake_Forms_Config_Condition_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Condition_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_condition_heading(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_condition_heading(inputs)
	return en_intake_forms_config_condition_heading(inputs)
});