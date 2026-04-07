/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_Reply_PlaceholderInputs */

const en_ticket_compose_reply_placeholder = /** @type {(inputs: Ticket_Compose_Reply_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type a reply...`)
};

const es_ticket_compose_reply_placeholder = /** @type {(inputs: Ticket_Compose_Reply_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe una respuesta...`)
};

/**
* | output |
* | --- |
* | "Type a reply..." |
*
* @param {Ticket_Compose_Reply_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_reply_placeholder = /** @type {((inputs?: Ticket_Compose_Reply_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_Reply_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_compose_reply_placeholder(inputs)
	return es_ticket_compose_reply_placeholder(inputs)
});