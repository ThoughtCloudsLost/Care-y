/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Slice_CollapseInputs */

const en_demo_flow_slice_collapse = /** @type {(inputs: Demo_Flow_Slice_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`collapse this interaction`)
};

const es_demo_flow_slice_collapse = /** @type {(inputs: Demo_Flow_Slice_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`contraer esta interacción`)
};

/**
* | output |
* | --- |
* | "collapse this interaction" |
*
* @param {Demo_Flow_Slice_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_collapse = /** @type {((inputs?: Demo_Flow_Slice_CollapseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Slice_CollapseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_slice_collapse(inputs)
	return es_demo_flow_slice_collapse(inputs)
});