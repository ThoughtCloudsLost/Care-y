/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Export_Confirm_ActionInputs */

const en_intake_responses_export_confirm_action = /** @type {(inputs: Intake_Responses_Export_Confirm_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export`)
};

const es_intake_responses_export_confirm_action = /** @type {(inputs: Intake_Responses_Export_Confirm_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar`)
};

/**
* | output |
* | --- |
* | "Export" |
*
* @param {Intake_Responses_Export_Confirm_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_action = /** @type {((inputs?: Intake_Responses_Export_Confirm_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_Confirm_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_export_confirm_action(inputs)
	return es_intake_responses_export_confirm_action(inputs)
});