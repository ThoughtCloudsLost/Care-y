/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ index: NonNullable<unknown>, count: NonNullable<unknown> }} Demo_Flow_Detail_StepInputs */

const en_demo_flow_detail_step = /** @type {(inputs: Demo_Flow_Detail_StepInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Step ${i?.index} of ${i?.count}`)
};

const es_demo_flow_detail_step = /** @type {(inputs: Demo_Flow_Detail_StepInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Paso ${i?.index} de ${i?.count}`)
};

/**
* | output |
* | --- |
* | "Step {index} of {count}" |
*
* @param {Demo_Flow_Detail_StepInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_step = /** @type {((inputs: Demo_Flow_Detail_StepInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_StepInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_step(inputs)
	return es_demo_flow_detail_step(inputs)
});