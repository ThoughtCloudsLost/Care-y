/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Export_Confirm_TitleInputs */

const en_intake_responses_export_confirm_title = /** @type {(inputs: Intake_Responses_Export_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export decrypted responses?`)
};

const es_intake_responses_export_confirm_title = /** @type {(inputs: Intake_Responses_Export_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Exportar respuestas descifradas?`)
};

const en_xa2_intake_responses_export_confirm_title = /** @type {(inputs: Intake_Responses_Export_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpòrt dècryptèd rèspònsès? •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Export decrypted responses?" |
*
* @param {Intake_Responses_Export_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_title = /** @type {((inputs?: Intake_Responses_Export_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_export_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_export_confirm_title(inputs)
	return en_intake_responses_export_confirm_title(inputs)
});