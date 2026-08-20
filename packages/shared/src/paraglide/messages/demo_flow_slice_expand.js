/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Slice_ExpandInputs */

const en_demo_flow_slice_expand = /** @type {(inputs: Demo_Flow_Slice_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`expand this interaction`)
};

const es_demo_flow_slice_expand = /** @type {(inputs: Demo_Flow_Slice_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`expandir esta interacción`)
};

/**
* | output |
* | --- |
* | "expand this interaction" |
*
* @param {Demo_Flow_Slice_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_expand = /** @type {((inputs?: Demo_Flow_Slice_ExpandInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Slice_ExpandInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_slice_expand(inputs)
	return es_demo_flow_slice_expand(inputs)
});