/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Take_A_Call_Step4Inputs */

const en_demo_guide_take_a_call_step4 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Find the new ticket in the ticket list.`)
};

const es_demo_guide_take_a_call_step4 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Busca el nuevo ticket en la lista de tickets.`)
};

const en_xa2_demo_guide_take_a_call_step4 = /** @type {(inputs: Demo_Guide_Take_A_Call_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìnd thè nèw tìckèt ìn thè tìckèt lìst. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Find the new ticket in the ticket list." |
*
* @param {Demo_Guide_Take_A_Call_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_take_a_call_step4 = /** @type {((inputs?: Demo_Guide_Take_A_Call_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Take_A_Call_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_take_a_call_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_take_a_call_step4(inputs)
	return en_demo_guide_take_a_call_step4(inputs)
});