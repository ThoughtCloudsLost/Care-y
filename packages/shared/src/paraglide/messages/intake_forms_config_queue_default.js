/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Config_Queue_DefaultInputs */

const en_intake_forms_config_queue_default = /** @type {(inputs: Intake_Forms_Config_Queue_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default (form destination)`)
};

const es_intake_forms_config_queue_default = /** @type {(inputs: Intake_Forms_Config_Queue_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Predeterminada (destino del formulario)`)
};

const en_xa2_intake_forms_config_queue_default = /** @type {(inputs: Intake_Forms_Config_Queue_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèfàùlt (fòrm dèstìnàtìòn) ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Default (form destination)" |
*
* @param {Intake_Forms_Config_Queue_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_queue_default = /** @type {((inputs?: Intake_Forms_Config_Queue_DefaultInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Queue_DefaultInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_config_queue_default(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_config_queue_default(inputs)
	return en_intake_forms_config_queue_default(inputs)
});