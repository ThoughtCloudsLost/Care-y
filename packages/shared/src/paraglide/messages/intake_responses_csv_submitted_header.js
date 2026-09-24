/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Csv_Submitted_HeaderInputs */

const en_intake_responses_csv_submitted_header = /** @type {(inputs: Intake_Responses_Csv_Submitted_HeaderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submitted`)
};

const es_intake_responses_csv_submitted_header = /** @type {(inputs: Intake_Responses_Csv_Submitted_HeaderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviado`)
};

const en_xa2_intake_responses_csv_submitted_header = /** @type {(inputs: Intake_Responses_Csv_Submitted_HeaderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùbmìttèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Submitted" |
*
* @param {Intake_Responses_Csv_Submitted_HeaderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_csv_submitted_header = /** @type {((inputs?: Intake_Responses_Csv_Submitted_HeaderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Csv_Submitted_HeaderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_csv_submitted_header(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_csv_submitted_header(inputs)
	return en_intake_responses_csv_submitted_header(inputs)
});