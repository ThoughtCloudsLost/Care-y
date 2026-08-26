/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Export_Confirm_TitleInputs */

const en_intake_responses_export_confirm_title = /** @type {(inputs: Intake_Responses_Export_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export decrypted responses?`)
};

const es_intake_responses_export_confirm_title = /** @type {(inputs: Intake_Responses_Export_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar respuestas descifradas?`)
};

/**
* | output |
* | --- |
* | "Export decrypted responses?" |
*
* @param {Intake_Responses_Export_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_title = /** @type {((inputs?: Intake_Responses_Export_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_export_confirm_title(inputs)
	return es_intake_responses_export_confirm_title(inputs)
});