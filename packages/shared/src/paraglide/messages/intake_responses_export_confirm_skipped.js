/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ skippedCount: NonNullable<unknown> }} Intake_Responses_Export_Confirm_SkippedInputs */

const en_intake_responses_export_confirm_skipped = /** @type {(inputs: Intake_Responses_Export_Confirm_SkippedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.skippedCount} responses could not be decrypted and will not be included.`)
};

const es_intake_responses_export_confirm_skipped = /** @type {(inputs: Intake_Responses_Export_Confirm_SkippedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.skippedCount} respuestas no se pudieron descifrar y no se incluiran.`)
};

/**
* | output |
* | --- |
* | "{skippedCount} responses could not be decrypted and will not be included." |
*
* @param {Intake_Responses_Export_Confirm_SkippedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_skipped = /** @type {((inputs: Intake_Responses_Export_Confirm_SkippedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Export_Confirm_SkippedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_export_confirm_skipped(inputs)
	return es_intake_responses_export_confirm_skipped(inputs)
});