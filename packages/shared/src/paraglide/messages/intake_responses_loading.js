/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_LoadingInputs */

const en_intake_responses_loading = /** @type {(inputs: Intake_Responses_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decrypting responses...`)
};

const es_intake_responses_loading = /** @type {(inputs: Intake_Responses_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descifrando respuestas...`)
};

/**
* | output |
* | --- |
* | "Decrypting responses..." |
*
* @param {Intake_Responses_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_loading = /** @type {((inputs?: Intake_Responses_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_loading(inputs)
	return es_intake_responses_loading(inputs)
});