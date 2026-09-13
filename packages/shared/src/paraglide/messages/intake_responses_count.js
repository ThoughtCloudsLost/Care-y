/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Intake_Responses_CountInputs */

const en_intake_responses_count = /** @type {(inputs: Intake_Responses_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} responses`)
};

const es_intake_responses_count = /** @type {(inputs: Intake_Responses_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} respuestas`)
};

/**
* | output |
* | --- |
* | "{count} responses" |
*
* @param {Intake_Responses_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_count = /** @type {((inputs: Intake_Responses_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_count(inputs)
	return es_intake_responses_count(inputs)
});