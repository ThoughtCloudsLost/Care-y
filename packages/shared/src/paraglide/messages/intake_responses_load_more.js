/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Load_MoreInputs */

const en_intake_responses_load_more = /** @type {(inputs: Intake_Responses_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load more`)
};

const es_intake_responses_load_more = /** @type {(inputs: Intake_Responses_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar mas`)
};

/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Intake_Responses_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_load_more = /** @type {((inputs?: Intake_Responses_Load_MoreInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Load_MoreInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_responses_load_more(inputs)
	return es_intake_responses_load_more(inputs)
});