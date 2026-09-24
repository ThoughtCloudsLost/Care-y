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

const en_xa2_demo_topic_filters = /** @type {(inputs: Demo_Topic_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèrs •••⟧`)
};

/**
* | output |
* | --- |
* | "Filters" |
*
* @param {Demo_Topic_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_filters = /** @type {((inputs?: Demo_Topic_FiltersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_FiltersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_filters(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_filters(inputs)
	return en_demo_topic_filters(inputs)
});