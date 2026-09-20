/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Responses_Load_MoreInputs */

const en_intake_responses_load_more = /** @type {(inputs: Intake_Responses_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load more`)
};

const es_intake_responses_load_more = /** @type {(inputs: Intake_Responses_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar más`)
};

const en_xa2_intake_responses_load_more = /** @type {(inputs: Intake_Responses_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàd mòrè •••⟧`)
};

/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Intake_Responses_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_load_more = /** @type {((inputs?: Intake_Responses_Load_MoreInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Responses_Load_MoreInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_responses_load_more(inputs)
	if (locale === "en-XA") return en_xa2_intake_responses_load_more(inputs)
	return en_intake_responses_load_more(inputs)
});