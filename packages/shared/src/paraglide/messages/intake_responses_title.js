/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_TitleInputs */

const en_intake_responses_title = /** @type {(inputs: Intake_Responses_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responses`)
};

const es_intake_responses_title = /** @type {(inputs: Intake_Responses_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuestas`)
};

/**
* | output |
* | --- |
* | "Responses" |
*
* @param {Intake_Responses_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_title = /** @type {((inputs?: Intake_Responses_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_title(inputs)
	return es_intake_responses_title(inputs)
});