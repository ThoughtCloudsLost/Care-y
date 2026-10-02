/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Take_A_Call_Step1Inputs */

const en_demo_guide_take_a_call_step1 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the intake form and fill in the caller's name and message.`)
};

const es_demo_guide_take_a_call_step1 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el formulario de admisión y completa el nombre y el mensaje de la persona que llama.`)
};

const en_xa2_demo_guide_take_a_call_step1 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè ìntàkè fòrm ànd fìll ìn thè càllèr's nàmè ànd mèssàgè. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the intake form and fill in the caller's name and message." |
*
* @param {Demo_Guide_Take_A_Call_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_take_a_call_step1 = /** @type {((inputs?: Demo_Guide_Take_A_Call_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Take_A_Call_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_take_a_call_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_take_a_call_step1(inputs)
	return en_demo_guide_take_a_call_step1(inputs)
});