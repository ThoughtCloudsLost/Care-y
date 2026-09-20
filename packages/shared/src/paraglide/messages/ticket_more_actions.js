/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_More_ActionsInputs */

const en_ticket_more_actions = /** @type {(inputs: Ticket_More_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`More actions`)
};

const es_ticket_more_actions = /** @type {(inputs: Ticket_More_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Más acciones`)
};

const en_xa2_ticket_more_actions = /** @type {(inputs: Ticket_More_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòrè àctìòns ••••⟧`)
};

/**
* | output |
* | --- |
* | "More actions" |
*
* @param {Ticket_More_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_more_actions = /** @type {((inputs?: Ticket_More_ActionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_More_ActionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_more_actions(inputs)
	if (locale === "en-XA") return en_xa2_ticket_more_actions(inputs)
	return en_ticket_more_actions(inputs)
});