/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Dismiss1Inputs */

const en_mergecandidates_dismiss1 = /** @type {(inputs: Mergecandidates_Dismiss1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

const es_mergecandidates_dismiss1 = /** @type {(inputs: Mergecandidates_Dismiss1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Mergecandidates_Dismiss1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
const mergecandidates_dismiss1 = /** @type {((inputs?: Mergecandidates_Dismiss1Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Dismiss1Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mergecandidates_dismiss1(inputs)
	return es_mergecandidates_dismiss1(inputs)
});
export { mergecandidates_dismiss1 as "mergeCandidates_dismiss" }