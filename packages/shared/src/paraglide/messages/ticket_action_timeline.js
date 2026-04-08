/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_TimelineInputs */

const en_ticket_action_timeline = /** @type {(inputs: Ticket_Action_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View timeline`)
};

const es_ticket_action_timeline = /** @type {(inputs: Ticket_Action_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver cronologia`)
};

/**
* | output |
* | --- |
* | "View timeline" |
*
* @param {Ticket_Action_TimelineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_timeline = /** @type {((inputs?: Ticket_Action_TimelineInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_TimelineInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_timeline(inputs)
	return es_ticket_action_timeline(inputs)
});