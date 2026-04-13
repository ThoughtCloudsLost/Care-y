/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_More_ActionsInputs */

const en_ticket_more_actions = /** @type {(inputs: Ticket_More_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`More actions`)
};

const es_ticket_more_actions = /** @type {(inputs: Ticket_More_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mas acciones`)
};

/**
* | output |
* | --- |
* | "More actions" |
*
* @param {Ticket_More_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_more_actions = /** @type {((inputs?: Ticket_More_ActionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_More_ActionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_more_actions(inputs)
	return es_ticket_more_actions(inputs)
});