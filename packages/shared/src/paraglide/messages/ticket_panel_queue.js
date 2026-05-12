/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Ticket_Panel_QueueInputs */

const en_ticket_panel_queue = /** @type {(inputs: Ticket_Panel_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const es_ticket_panel_queue = /** @type {(inputs: Ticket_Panel_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Ticket_Panel_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_queue = /** @type {((inputs: Ticket_Panel_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Panel_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_panel_queue(inputs)
	return es_ticket_panel_queue(inputs)
});