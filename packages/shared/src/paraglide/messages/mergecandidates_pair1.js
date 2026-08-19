/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ aliasA: NonNullable<unknown>, aliasB: NonNullable<unknown> }} Mergecandidates_Pair1Inputs */

const en_mergecandidates_pair1 = /** @type {(inputs: Mergecandidates_Pair1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.aliasA} / ${i?.aliasB}`)
};

const es_mergecandidates_pair1 = /** @type {(inputs: Mergecandidates_Pair1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.aliasA} / ${i?.aliasB}`)
};

/**
* | output |
* | --- |
* | "{aliasA} / {aliasB}" |
*
* @param {Mergecandidates_Pair1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
const mergecandidates_pair1 = /** @type {((inputs: Mergecandidates_Pair1Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Pair1Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mergecandidates_pair1(inputs)
	return es_mergecandidates_pair1(inputs)
});
export { mergecandidates_pair1 as "mergeCandidates_pair" }