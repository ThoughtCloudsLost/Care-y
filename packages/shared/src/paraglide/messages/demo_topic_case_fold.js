/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_Case_FoldInputs */

const en_demo_topic_case_fold = /** @type {(inputs: Demo_Topic_Case_FoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Case details`)
};

const es_demo_topic_case_fold = /** @type {(inputs: Demo_Topic_Case_FoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles del caso`)
};

const en_xa2_demo_topic_case_fold = /** @type {(inputs: Demo_Topic_Case_FoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càsè dètàìls ••••⟧`)
};

/**
* | output |
* | --- |
* | "Case details" |
*
* @param {Demo_Topic_Case_FoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_case_fold = /** @type {((inputs?: Demo_Topic_Case_FoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_Case_FoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_case_fold(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_case_fold(inputs)
	return en_demo_topic_case_fold(inputs)
});