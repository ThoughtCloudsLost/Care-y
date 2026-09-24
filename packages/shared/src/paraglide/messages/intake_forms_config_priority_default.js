/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Priority_DefaultInputs */

const en_intake_forms_config_priority_default = /** @type {(inputs: Intake_Forms_Config_Priority_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default (normal)`)
};

const es_intake_forms_config_priority_default = /** @type {(inputs: Intake_Forms_Config_Priority_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Predeterminada (normal)`)
};

const en_xa2_intake_forms_config_priority_default = /** @type {(inputs: Intake_Forms_Config_Priority_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèfàùlt (nòrmàl) •••••⟧`)
};

/**
* | output |
* | --- |
* | "Default (normal)" |
*
* @param {Intake_Forms_Config_Priority_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_priority_default = /** @type {((inputs?: Intake_Forms_Config_Priority_DefaultInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Priority_DefaultInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_priority_default(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_priority_default(inputs)
	return en_intake_forms_config_priority_default(inputs)
});