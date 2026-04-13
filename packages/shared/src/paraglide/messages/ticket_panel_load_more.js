/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_Load_MoreInputs */

const en_ticket_panel_load_more = /** @type {(inputs: Ticket_Panel_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load more`)
};

const es_ticket_panel_load_more = /** @type {(inputs: Ticket_Panel_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar mas`)
};

/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Ticket_Panel_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_load_more = /** @type {((inputs?: Ticket_Panel_Load_MoreInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_Load_MoreInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_load_more(inputs)
	return es_ticket_panel_load_more(inputs)
});