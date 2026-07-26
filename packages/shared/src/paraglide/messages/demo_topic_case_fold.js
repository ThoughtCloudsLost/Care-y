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

/**
* | output |
* | --- |
* | "Case details" |
*
* @param {Demo_Topic_Case_FoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_case_fold = /** @type {((inputs?: Demo_Topic_Case_FoldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_Case_FoldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_case_fold(inputs)
	return es_demo_topic_case_fold(inputs)
});