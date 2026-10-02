/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Assign_A_Ticket_Step3Inputs */

const en_demo_guide_assign_a_ticket_step3 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fold the details away.`)
};

const es_demo_guide_assign_a_ticket_step3 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pliega los detalles.`)
};

const en_xa2_demo_guide_assign_a_ticket_step3 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòld thè dètàìls àwày. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Fold the details away." |
*
* @param {Demo_Guide_Assign_A_Ticket_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_assign_a_ticket_step3 = /** @type {((inputs?: Demo_Guide_Assign_A_Ticket_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Assign_A_Ticket_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_assign_a_ticket_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_assign_a_ticket_step3(inputs)
	return en_demo_guide_assign_a_ticket_step3(inputs)
});