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

const en_xa2_demo_flow_slice_expand = /** @type {(inputs: Demo_Flow_Slice_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦èxpànd thìs ìntèràctìòn •••••••⟧`)
};

/**
* | output |
* | --- |
* | "expand this interaction" |
*
* @param {Demo_Flow_Slice_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_expand = /** @type {((inputs?: Demo_Flow_Slice_ExpandInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Slice_ExpandInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_slice_expand(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_slice_expand(inputs)
	return en_demo_flow_slice_expand(inputs)
});