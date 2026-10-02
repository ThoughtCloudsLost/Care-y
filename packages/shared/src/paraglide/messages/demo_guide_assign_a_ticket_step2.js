/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Assign_A_Ticket_Step2Inputs */

const en_demo_guide_assign_a_ticket_step2 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Review the case header.`)
};

const es_demo_guide_assign_a_ticket_step2 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revisa el encabezado del caso.`)
};

const en_xa2_demo_guide_assign_a_ticket_step2 = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèvìèw thè càsè hèàdèr. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Review the case header." |
*
* @param {Demo_Guide_Assign_A_Ticket_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_assign_a_ticket_step2 = /** @type {((inputs?: Demo_Guide_Assign_A_Ticket_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Assign_A_Ticket_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_assign_a_ticket_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_assign_a_ticket_step2(inputs)
	return en_demo_guide_assign_a_ticket_step2(inputs)
});