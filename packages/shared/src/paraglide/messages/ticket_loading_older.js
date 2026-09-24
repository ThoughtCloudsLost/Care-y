/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Loading_OlderInputs */

const en_ticket_loading_older = /** @type {(inputs: Ticket_Loading_OlderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading older messages...`)
};

const es_ticket_loading_older = /** @type {(inputs: Ticket_Loading_OlderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando mensajes anteriores...`)
};

const en_xa2_ticket_loading_older = /** @type {(inputs: Ticket_Loading_OlderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng òldèr mèssàgès... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Loading older messages..." |
*
* @param {Ticket_Loading_OlderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_loading_older = /** @type {((inputs?: Ticket_Loading_OlderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Loading_OlderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_loading_older(inputs)
	if (locale === "en-XA") return en_xa2_ticket_loading_older(inputs)
	return en_ticket_loading_older(inputs)
});