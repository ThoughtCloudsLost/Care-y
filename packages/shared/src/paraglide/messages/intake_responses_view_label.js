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

const en_xa2_intake_responses_view_label = /** @type {(inputs: Intake_Responses_View_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw rèspònsès •••••⟧`)
};

/**
* | output |
* | --- |
* | "View responses" |
*
* @param {Intake_Responses_View_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_view_label = /** @type {((inputs?: Intake_Responses_View_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_View_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_view_label(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_view_label(inputs)
	return en_intake_responses_view_label(inputs)
});