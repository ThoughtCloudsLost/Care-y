/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_FiltersInputs */

const en_demo_topic_filters = /** @type {(inputs: Demo_Topic_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filters`)
};

const es_demo_topic_filters = /** @type {(inputs: Demo_Topic_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtros`)
};

/**
* | output |
* | --- |
* | "Filters" |
*
* @param {Demo_Topic_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_filters = /** @type {((inputs?: Demo_Topic_FiltersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_FiltersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_filters(inputs)
	return es_demo_topic_filters(inputs)
});