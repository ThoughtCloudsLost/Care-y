/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_View_ModeInputs */

const en_ticket_view_mode = /** @type {(inputs: Ticket_View_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View mode`)
};

const es_ticket_view_mode = /** @type {(inputs: Ticket_View_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Modo de vista`)
};

/**
* | output |
* | --- |
* | "View mode" |
*
* @param {Ticket_View_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_view_mode = /** @type {((inputs?: Ticket_View_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_View_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_view_mode(inputs)
	return es_ticket_view_mode(inputs)
});