/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Export_CsvInputs */

const en_intake_responses_export_csv = /** @type {(inputs: Intake_Responses_Export_CsvInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export CSV`)
};

const es_intake_responses_export_csv = /** @type {(inputs: Intake_Responses_Export_CsvInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar CSV`)
};

const en_xa2_intake_responses_export_csv = /** @type {(inputs: Intake_Responses_Export_CsvInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpòrt CSV •••⟧`)
};

/**
* | output |
* | --- |
* | "Export CSV" |
*
* @param {Intake_Responses_Export_CsvInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_csv = /** @type {((inputs?: Intake_Responses_Export_CsvInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_CsvInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_export_csv(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_export_csv(inputs)
	return en_intake_responses_export_csv(inputs)
});