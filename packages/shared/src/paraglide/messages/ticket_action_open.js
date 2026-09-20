/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_OpenInputs */

const en_ticket_action_open = /** @type {(inputs: Ticket_Action_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open`)
};

const es_ticket_action_open = /** @type {(inputs: Ticket_Action_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abierto`)
};

const en_xa2_ticket_action_open = /** @type {(inputs: Ticket_Action_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn ••⟧`)
};

/**
* | output |
* | --- |
* | "Open" |
*
* @param {Ticket_Action_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_open = /** @type {((inputs?: Ticket_Action_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_open(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_open(inputs)
	return en_ticket_action_open(inputs)
});