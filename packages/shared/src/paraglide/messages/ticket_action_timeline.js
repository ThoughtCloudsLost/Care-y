/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_TimelineInputs */

const en_ticket_action_timeline = /** @type {(inputs: Ticket_Action_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View timeline`)
};

const es_ticket_action_timeline = /** @type {(inputs: Ticket_Action_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver cronología`)
};

const en_xa2_ticket_action_timeline = /** @type {(inputs: Ticket_Action_TimelineInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw tìmèlìnè ••••⟧`)
};

/**
* | output |
* | --- |
* | "View timeline" |
*
* @param {Ticket_Action_TimelineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_timeline = /** @type {((inputs?: Ticket_Action_TimelineInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_TimelineInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_timeline(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_timeline(inputs)
	return en_ticket_action_timeline(inputs)
});