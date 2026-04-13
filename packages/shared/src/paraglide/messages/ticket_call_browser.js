/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Call_BrowserInputs */

const en_ticket_call_browser = /** @type {(inputs: Ticket_Call_BrowserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call via browser`)
};

const es_ticket_call_browser = /** @type {(inputs: Ticket_Call_BrowserInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar por navegador`)
};

/**
* | output |
* | --- |
* | "Call via browser" |
*
* @param {Ticket_Call_BrowserInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_browser = /** @type {((inputs?: Ticket_Call_BrowserInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_BrowserInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_call_browser(inputs)
	return es_ticket_call_browser(inputs)
});