/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Panel_OpenedInputs */

const en_ticket_panel_opened = /** @type {(inputs: Ticket_Panel_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opened`)
};

const es_ticket_panel_opened = /** @type {(inputs: Ticket_Panel_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abierto`)
};

/**
* | output |
* | --- |
* | "Opened" |
*
* @param {Ticket_Panel_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_opened = /** @type {((inputs?: Ticket_Panel_OpenedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_OpenedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_opened(inputs)
	return es_ticket_panel_opened(inputs)
});