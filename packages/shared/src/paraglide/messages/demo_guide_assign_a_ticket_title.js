/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Assign_A_Ticket_TitleInputs */

const en_demo_guide_assign_a_ticket_title = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assign a ticket`)
};

const es_demo_guide_assign_a_ticket_title = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignar un ticket`)
};

const en_xa2_demo_guide_assign_a_ticket_title = /** @type {(inputs: Demo_Guide_Assign_A_Ticket_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgn à tìckèt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Assign a ticket" |
*
* @param {Demo_Guide_Assign_A_Ticket_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_assign_a_ticket_title = /** @type {((inputs?: Demo_Guide_Assign_A_Ticket_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Assign_A_Ticket_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_assign_a_ticket_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_assign_a_ticket_title(inputs)
	return en_demo_guide_assign_a_ticket_title(inputs)
});