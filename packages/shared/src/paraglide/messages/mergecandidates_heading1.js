/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Heading1Inputs */

const en_mergecandidates_heading1 = /** @type {(inputs: Mergecandidates_Heading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Possible Duplicates`)
};

const es_mergecandidates_heading1 = /** @type {(inputs: Mergecandidates_Heading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Posibles duplicados`)
};

const en_xa2_mergecandidates_heading1 = /** @type {(inputs: Mergecandidates_Heading1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pòssìblè Dùplìcàtès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Possible Duplicates" |
*
* @param {Mergecandidates_Heading1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
const mergecandidates_heading1 = /** @type {((inputs?: Mergecandidates_Heading1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Heading1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mergecandidates_heading1(inputs)
	if (locale === "en-XA") return en_xa2_mergecandidates_heading1(inputs)
	return en_mergecandidates_heading1(inputs)
});
export { mergecandidates_heading1 as "mergeCandidates_heading" }