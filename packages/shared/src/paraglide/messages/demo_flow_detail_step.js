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

const en_xa2_demo_flow_detail_step = /** @type {(inputs: Demo_Flow_Detail_StepInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Stèp  ••${i?.index} òf  ••${i?.count}⟧`)
};

/**
* | output |
* | --- |
* | "Step {index} of {count}" |
*
* @param {Demo_Flow_Detail_StepInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_step = /** @type {((inputs: Demo_Flow_Detail_StepInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_StepInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_step(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_step(inputs)
	return en_demo_flow_detail_step(inputs)
});