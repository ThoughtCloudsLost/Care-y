/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_Load_MoreInputs */

const en_ticket_panel_load_more = /** @type {(inputs: Ticket_Panel_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load more`)
};

const es_ticket_panel_load_more = /** @type {(inputs: Ticket_Panel_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar más`)
};

const en_xa2_ticket_panel_load_more = /** @type {(inputs: Ticket_Panel_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàd mòrè •••⟧`)
};

/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Ticket_Panel_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_load_more = /** @type {((inputs?: Ticket_Panel_Load_MoreInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_Load_MoreInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_panel_load_more(inputs)
	if (locale === "en-XA") return en_xa2_ticket_panel_load_more(inputs)
	return en_ticket_panel_load_more(inputs)
});