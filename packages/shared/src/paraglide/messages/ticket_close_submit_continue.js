/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Close_Submit_ContinueInputs */

const en_ticket_close_submit_continue = /** @type {(inputs: Ticket_Close_Submit_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submit`)
};

const es_ticket_close_submit_continue = /** @type {(inputs: Ticket_Close_Submit_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar`)
};

/**
* | output |
* | --- |
* | "Submit" |
*
* @param {Ticket_Close_Submit_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_close_submit_continue = /** @type {((inputs?: Ticket_Close_Submit_ContinueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Close_Submit_ContinueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_close_submit_continue(inputs)
	return es_ticket_close_submit_continue(inputs)
});