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

const en_xa2_intake_responses_export_confirm_action = /** @type {(inputs: Intake_Responses_Export_Confirm_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpòrt ••⟧`)
};

/**
* | output |
* | --- |
* | "Export" |
*
* @param {Intake_Responses_Export_Confirm_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_action = /** @type {((inputs?: Intake_Responses_Export_Confirm_ActionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_Confirm_ActionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_export_confirm_action(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_export_confirm_action(inputs)
	return en_intake_responses_export_confirm_action(inputs)
});