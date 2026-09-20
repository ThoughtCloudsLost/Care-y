/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Demo_Flow_Slice_StepsInputs */

const en_demo_flow_slice_steps = /** @type {(inputs: Demo_Flow_Slice_StepsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} steps`)
};

const es_demo_flow_slice_steps = /** @type {(inputs: Demo_Flow_Slice_StepsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} pasos`)
};

const en_xa2_demo_flow_slice_steps = /** @type {(inputs: Demo_Flow_Slice_StepsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} stèps ••⟧`)
};

/**
* | output |
* | --- |
* | "{count} steps" |
*
* @param {Demo_Flow_Slice_StepsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_steps = /** @type {((inputs: Demo_Flow_Slice_StepsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Slice_StepsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_slice_steps(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_slice_steps(inputs)
	return en_demo_flow_slice_steps(inputs)
});