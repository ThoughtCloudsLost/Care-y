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

const en_xa2_demo_topic_sort = /** @type {(inputs: Demo_Topic_SortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòrt ••⟧`)
};

/**
* | output |
* | --- |
* | "Sort" |
*
* @param {Demo_Topic_SortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_sort = /** @type {((inputs?: Demo_Topic_SortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_SortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_sort(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_sort(inputs)
	return en_demo_topic_sort(inputs)
});