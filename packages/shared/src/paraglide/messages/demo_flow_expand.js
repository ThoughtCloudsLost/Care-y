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

const en_xa2_demo_flow_expand = /** @type {(inputs: Demo_Flow_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shòw stèp dètàìls ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Show step details" |
*
* @param {Demo_Flow_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_expand = /** @type {((inputs?: Demo_Flow_ExpandInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_ExpandInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_expand(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_expand(inputs)
	return en_demo_flow_expand(inputs)
});