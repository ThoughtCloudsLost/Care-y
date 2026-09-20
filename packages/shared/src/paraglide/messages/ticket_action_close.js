/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_CloseInputs */

const en_ticket_action_close = /** @type {(inputs: Ticket_Action_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close`)
};

const es_ticket_action_close = /** @type {(inputs: Ticket_Action_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar`)
};

const en_xa2_ticket_action_close = /** @type {(inputs: Ticket_Action_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsè ••⟧`)
};

/**
* | output |
* | --- |
* | "Close" |
*
* @param {Ticket_Action_CloseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_close = /** @type {((inputs?: Ticket_Action_CloseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_CloseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_close(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_close(inputs)
	return en_ticket_action_close(inputs)
});