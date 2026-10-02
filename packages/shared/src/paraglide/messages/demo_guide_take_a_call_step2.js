/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Take_A_Call_Step2Inputs */

const en_demo_guide_take_a_call_step2 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose the caller's preferred contact method.`)
};

const es_demo_guide_take_a_call_step2 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige el método de contacto preferido de la persona que llama.`)
};

const en_xa2_demo_guide_take_a_call_step2 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè thè càllèr's prèfèrrèd còntàct mèthòd. ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose the caller's preferred contact method." |
*
* @param {Demo_Guide_Take_A_Call_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_take_a_call_step2 = /** @type {((inputs?: Demo_Guide_Take_A_Call_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Take_A_Call_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_take_a_call_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_take_a_call_step2(inputs)
	return en_demo_guide_take_a_call_step2(inputs)
});