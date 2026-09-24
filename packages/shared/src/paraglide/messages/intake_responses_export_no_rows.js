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

const en_xa2_intake_responses_export_no_rows = /** @type {(inputs: Intake_Responses_Export_No_RowsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò dècryptèd rèspònsès tò èxpòrt. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No decrypted responses to export." |
*
* @param {Intake_Responses_Export_No_RowsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_no_rows = /** @type {((inputs?: Intake_Responses_Export_No_RowsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_No_RowsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_export_no_rows(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_export_no_rows(inputs)
	return en_intake_responses_export_no_rows(inputs)
});