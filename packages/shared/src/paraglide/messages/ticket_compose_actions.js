/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_ActionsInputs */

const en_ticket_compose_actions = /** @type {(inputs: Ticket_Compose_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compose actions`)
};

const es_ticket_compose_actions = /** @type {(inputs: Ticket_Compose_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acciones de composicion`)
};

/**
* | output |
* | --- |
* | "Compose actions" |
*
* @param {Ticket_Compose_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_actions = /** @type {((inputs?: Ticket_Compose_ActionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_ActionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_compose_actions(inputs)
	return es_ticket_compose_actions(inputs)
});