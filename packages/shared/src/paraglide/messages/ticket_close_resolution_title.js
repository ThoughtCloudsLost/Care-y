/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Ticket_Close_Resolution_TitleInputs */

const en_ticket_close_resolution_title = /** @type {(inputs: Ticket_Close_Resolution_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Close ${i?.ticket}`)
};

const es_ticket_close_resolution_title = /** @type {(inputs: Ticket_Close_Resolution_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cerrar ${i?.ticket}`)
};

/**
* | output |
* | --- |
* | "Close {ticket}" |
*
* @param {Ticket_Close_Resolution_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_close_resolution_title = /** @type {((inputs: Ticket_Close_Resolution_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Close_Resolution_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_close_resolution_title(inputs)
	return en_ticket_close_resolution_title(inputs)
});