/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ step: NonNullable<unknown>, total: NonNullable<unknown> }} Demo_Step_OfInputs */

const en_demo_step_of = /** @type {(inputs: Demo_Step_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Step ${i?.step} of ${i?.total}`)
};

const es_demo_step_of = /** @type {(inputs: Demo_Step_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Paso ${i?.step} de ${i?.total}`)
};

const en_xa2_demo_step_of = /** @type {(inputs: Demo_Step_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Stèp  ••${i?.step} òf  ••${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "Step {step} of {total}" |
*
* @param {Demo_Step_OfInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_step_of = /** @type {((inputs: Demo_Step_OfInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Step_OfInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_step_of(inputs)
	if (locale === "en-XA") return en_xa2_demo_step_of(inputs)
	return en_demo_step_of(inputs)
});