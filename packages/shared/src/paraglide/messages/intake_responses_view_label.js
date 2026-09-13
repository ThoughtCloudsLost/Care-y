/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_View_LabelInputs */

const en_intake_responses_view_label = /** @type {(inputs: Intake_Responses_View_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View responses`)
};

const es_intake_responses_view_label = /** @type {(inputs: Intake_Responses_View_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver respuestas`)
};

/**
* | output |
* | --- |
* | "View responses" |
*
* @param {Intake_Responses_View_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_view_label = /** @type {((inputs?: Intake_Responses_View_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_View_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_view_label(inputs)
	return es_intake_responses_view_label(inputs)
});