/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Timeline_Nav_LabelInputs */

const en_ticket_timeline_nav_label = /** @type {(inputs: Ticket_Timeline_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conversation timeline`)
};

const es_ticket_timeline_nav_label = /** @type {(inputs: Ticket_Timeline_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cronologia de la conversacion`)
};

/**
* | output |
* | --- |
* | "Conversation timeline" |
*
* @param {Ticket_Timeline_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_nav_label = /** @type {((inputs?: Ticket_Timeline_Nav_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Nav_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_nav_label(inputs)
	return es_ticket_timeline_nav_label(inputs)
});