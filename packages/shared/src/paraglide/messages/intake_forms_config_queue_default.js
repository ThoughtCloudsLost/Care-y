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

/**
* | output |
* | --- |
* | "Default (form destination)" |
*
* @param {Intake_Forms_Config_Queue_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_queue_default = /** @type {((inputs?: Intake_Forms_Config_Queue_DefaultInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Config_Queue_DefaultInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_config_queue_default(inputs)
	return es_intake_forms_config_queue_default(inputs)
});