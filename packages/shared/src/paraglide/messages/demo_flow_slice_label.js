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

const en_xa2_demo_flow_slice_label = /** @type {(inputs: Demo_Flow_Slice_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìntèràctìòn  ••••${i?.index}⟧`)
};

/**
* | output |
* | --- |
* | "Interaction {index}" |
*
* @param {Demo_Flow_Slice_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_label = /** @type {((inputs: Demo_Flow_Slice_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Slice_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_slice_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_slice_label(inputs)
	return en_demo_flow_slice_label(inputs)
});