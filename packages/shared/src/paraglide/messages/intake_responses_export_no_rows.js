/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Export_No_RowsInputs */

const en_intake_responses_export_no_rows = /** @type {(inputs: Intake_Responses_Export_No_RowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No decrypted responses to export.`)
};

const es_intake_responses_export_no_rows = /** @type {(inputs: Intake_Responses_Export_No_RowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay respuestas descifradas para exportar.`)
};

/**
* | output |
* | --- |
* | "No decrypted responses to export." |
*
* @param {Intake_Responses_Export_No_RowsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_no_rows = /** @type {((inputs?: Intake_Responses_Export_No_RowsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_No_RowsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_export_no_rows(inputs)
	return es_intake_responses_export_no_rows(inputs)
});