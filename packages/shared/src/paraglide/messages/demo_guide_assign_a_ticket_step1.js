/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Assign_A_Ticket_Step1Inputs */

const en_demo_guide_assign_a_ticket_step1 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the Unassigned section on the dashboard and pick a ticket.`)
};

const es_demo_guide_assign_a_ticket_step1 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre la sección Sin asignar en el panel y elige un ticket.`)
};

const en_xa2_demo_guide_assign_a_ticket_step1 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè Ùnàssìgnèd sèctìòn òn thè dàshbòàrd ànd pìck à tìckèt. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the Unassigned section on the dashboard and pick a ticket." |
*
* @param {Demo_Guide_Assign_A_Ticket_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_assign_a_ticket_step1 = /** @type {((inputs?: Demo_Guide_Assign_A_Ticket_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Assign_A_Ticket_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_assign_a_ticket_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_assign_a_ticket_step1(inputs)
	return en_demo_guide_assign_a_ticket_step1(inputs)
});