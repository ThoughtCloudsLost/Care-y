/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_ExpandInputs */

const en_demo_flow_expand = /** @type {(inputs: Demo_Flow_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show step details`)
};

const es_demo_flow_expand = /** @type {(inputs: Demo_Flow_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver detalles del paso`)
};

/**
* | output |
* | --- |
* | "Show step details" |
*
* @param {Demo_Flow_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_expand = /** @type {((inputs?: Demo_Flow_ExpandInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_ExpandInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_expand(inputs)
	return es_demo_flow_expand(inputs)
});