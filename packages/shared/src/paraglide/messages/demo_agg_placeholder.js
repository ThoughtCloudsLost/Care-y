/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Agg_PlaceholderInputs */

const en_demo_agg_placeholder = /** @type {(inputs: Demo_Agg_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This view is coming soon.`)
};

const es_demo_agg_placeholder = /** @type {(inputs: Demo_Agg_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta vista estara disponible pronto.`)
};

const en_xa2_demo_agg_placeholder = /** @type {(inputs: Demo_Agg_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs vìèw ìs còmìng sòòn. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This view is coming soon." |
*
* @param {Demo_Agg_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_agg_placeholder = /** @type {((inputs?: Demo_Agg_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Agg_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_agg_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_demo_agg_placeholder(inputs)
	return en_demo_agg_placeholder(inputs)
});