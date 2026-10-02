/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Assign_A_Ticket_Step4Inputs */

const en_demo_guide_assign_a_ticket_step4 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Take or Assign from the ticket actions. The ticket moves to My tickets.`)
};

const es_demo_guide_assign_a_ticket_step4 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Tomar o Asignar en las acciones del ticket. El ticket pasa a Mis tickets.`)
};

const en_xa2_demo_guide_assign_a_ticket_step4 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Tàkè òr Àssìgn fròm thè tìckèt àctìòns. Thè tìckèt mòvès tò My tìckèts. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap Take or Assign from the ticket actions. The ticket moves to My tickets." |
*
* @param {Demo_Guide_Assign_A_Ticket_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_assign_a_ticket_step4 = /** @type {((inputs?: Demo_Guide_Assign_A_Ticket_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Assign_A_Ticket_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_assign_a_ticket_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_assign_a_ticket_step4(inputs)
	return en_demo_guide_assign_a_ticket_step4(inputs)
});