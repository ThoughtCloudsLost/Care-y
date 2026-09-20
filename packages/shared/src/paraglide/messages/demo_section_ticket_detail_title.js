/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Ticket_Detail_TitleInputs */

const en_demo_section_ticket_detail_title = /** @type {(inputs: Demo_Section_Ticket_Detail_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket detail`)
};

const es_demo_section_ticket_detail_title = /** @type {(inputs: Demo_Section_Ticket_Detail_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalle del ticket`)
};

const en_xa2_demo_section_ticket_detail_title = /** @type {(inputs: Demo_Section_Ticket_Detail_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèt dètàìl ••••⟧`)
};

/**
* | output |
* | --- |
* | "Ticket detail" |
*
* @param {Demo_Section_Ticket_Detail_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_ticket_detail_title = /** @type {((inputs?: Demo_Section_Ticket_Detail_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Ticket_Detail_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_ticket_detail_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_ticket_detail_title(inputs)
	return en_demo_section_ticket_detail_title(inputs)
});