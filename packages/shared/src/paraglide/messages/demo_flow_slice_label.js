/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ index: NonNullable<unknown> }} Demo_Flow_Slice_LabelInputs */

const en_demo_flow_slice_label = /** @type {(inputs: Demo_Flow_Slice_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Interaction ${i?.index}`)
};

const es_demo_flow_slice_label = /** @type {(inputs: Demo_Flow_Slice_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Interacción ${i?.index}`)
};

/**
* | output |
* | --- |
* | "Interaction {index}" |
*
* @param {Demo_Flow_Slice_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_label = /** @type {((inputs: Demo_Flow_Slice_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Slice_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_slice_label(inputs)
	return es_demo_flow_slice_label(inputs)
});