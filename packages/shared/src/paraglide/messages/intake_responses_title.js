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

const en_xa2_intake_responses_title = /** @type {(inputs: Intake_Responses_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèspònsès •••⟧`)
};

/**
* | output |
* | --- |
* | "Responses" |
*
* @param {Intake_Responses_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_title = /** @type {((inputs?: Intake_Responses_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_title(inputs)
	return en_intake_responses_title(inputs)
});