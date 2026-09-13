/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Truncated_Notice1Inputs */

const en_mergecandidates_truncated_notice1 = /** @type {(inputs: Mergecandidates_Truncated_Notice1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`There are more possible duplicates than shown. Resolve or dismiss some, or mark shared numbers, to see the rest.`)
};

const es_mergecandidates_truncated_notice1 = /** @type {(inputs: Mergecandidates_Truncated_Notice1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hay más duplicados posibles de los que se muestran. Resuelve o descarta algunos, o marca los números compartidos, para ver el resto.`)
};

/**
* | output |
* | --- |
* | "There are more possible duplicates than shown. Resolve or dismiss some, or mark shared numbers, to see the rest." |
*
* @param {Mergecandidates_Truncated_Notice1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
const mergecandidates_truncated_notice1 = /** @type {((inputs?: Mergecandidates_Truncated_Notice1Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Truncated_Notice1Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mergecandidates_truncated_notice1(inputs)
	return es_mergecandidates_truncated_notice1(inputs)
});
export { mergecandidates_truncated_notice1 as "mergeCandidates_truncated_notice" }