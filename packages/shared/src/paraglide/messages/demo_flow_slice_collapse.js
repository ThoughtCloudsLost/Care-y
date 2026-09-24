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

const en_xa2_demo_flow_slice_collapse = /** @type {(inputs: Demo_Flow_Slice_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦còllàpsè thìs ìntèràctìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "collapse this interaction" |
*
* @param {Demo_Flow_Slice_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_collapse = /** @type {((inputs?: Demo_Flow_Slice_CollapseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Slice_CollapseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_slice_collapse(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_slice_collapse(inputs)
	return en_demo_flow_slice_collapse(inputs)
});