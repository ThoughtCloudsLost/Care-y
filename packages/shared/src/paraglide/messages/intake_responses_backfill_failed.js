/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Backfill_FailedInputs */

const en_intake_responses_backfill_failed = /** @type {(inputs: Intake_Responses_Backfill_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to distribute key wraps for some submissions.`)
};

const es_intake_responses_backfill_failed = /** @type {(inputs: Intake_Responses_Backfill_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudieron distribuir las claves para algunas respuestas.`)
};

/**
* | output |
* | --- |
* | "Failed to distribute key wraps for some submissions." |
*
* @param {Intake_Responses_Backfill_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_backfill_failed = /** @type {((inputs?: Intake_Responses_Backfill_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Backfill_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_backfill_failed(inputs)
	return es_intake_responses_backfill_failed(inputs)
});