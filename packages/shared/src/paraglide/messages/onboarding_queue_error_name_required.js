/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Queue_Error_Name_RequiredInputs */

const en_onboarding_queue_error_name_required = /** @type {(inputs: Onboarding_Queue_Error_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue name is required.`)
};

const es_onboarding_queue_error_name_required = /** @type {(inputs: Onboarding_Queue_Error_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de la cola es obligatorio.`)
};

/**
* | output |
* | --- |
* | "Queue name is required." |
*
* @param {Onboarding_Queue_Error_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_error_name_required = /** @type {((inputs?: Onboarding_Queue_Error_Name_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Queue_Error_Name_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_queue_error_name_required(inputs)
	return es_onboarding_queue_error_name_required(inputs)
});