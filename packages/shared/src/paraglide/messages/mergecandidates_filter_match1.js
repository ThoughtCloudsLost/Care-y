/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Filter_Match1Inputs */

const en_mergecandidates_filter_match1 = /** @type {(inputs: Mergecandidates_Filter_Match1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Match`)
};

const es_mergecandidates_filter_match1 = /** @type {(inputs: Mergecandidates_Filter_Match1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coincidencia`)
};

const en_xa2_mergecandidates_filter_match1 = /** @type {(inputs: Mergecandidates_Filter_Match1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màtch ••⟧`)
};

/**
* | output |
* | --- |
* | "Match" |
*
* @param {Mergecandidates_Filter_Match1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
const mergecandidates_filter_match1 = /** @type {((inputs?: Mergecandidates_Filter_Match1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Filter_Match1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mergecandidates_filter_match1(inputs)
	if (locale === "en-XA") return en_xa2_mergecandidates_filter_match1(inputs)
	return en_mergecandidates_filter_match1(inputs)
});
export { mergecandidates_filter_match1 as "mergeCandidates_filter_match" }