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

const en_xa2_intake_responses_count = /** @type {(inputs: Intake_Responses_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} rèspònsès •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} responses" |
*
* @param {Intake_Responses_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_count = /** @type {((inputs: Intake_Responses_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_count(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_count(inputs)
	return en_intake_responses_count(inputs)
});