/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Link_Case_RemovedInputs */

const en_ticket_link_case_removed = /** @type {(inputs: Ticket_Link_Case_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlinked.`)
};

const es_ticket_link_case_removed = /** @type {(inputs: Ticket_Link_Case_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desvinculado.`)
};

/**
* | output |
* | --- |
* | "Unlinked." |
*
* @param {Ticket_Link_Case_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_removed = /** @type {((inputs?: Ticket_Link_Case_RemovedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Link_Case_RemovedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_link_case_removed(inputs)
	return en_ticket_link_case_removed(inputs)
});