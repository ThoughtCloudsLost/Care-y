/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_SortInputs */

const en_demo_topic_sort = /** @type {(inputs: Demo_Topic_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort`)
};

const es_demo_topic_sort = /** @type {(inputs: Demo_Topic_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ordenar`)
};

/**
* | output |
* | --- |
* | "Sort" |
*
* @param {Demo_Topic_SortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_sort = /** @type {((inputs?: Demo_Topic_SortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_SortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_sort(inputs)
	return es_demo_topic_sort(inputs)
});