/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Ticket_New_TitleInputs */

const en_ticket_new_title = /** @type {(inputs: Ticket_New_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`New ${i?.Ticket}`)
};

const es_ticket_new_title = /** @type {(inputs: Ticket_New_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nuevo ${i?.Ticket}`)
};

const en_xa2_ticket_new_title = /** @type {(inputs: Ticket_New_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nèw  ••${i?.Ticket}⟧`)
};

/**
* | output |
* | --- |
* | "New {Ticket}" |
*
* @param {Ticket_New_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_title = /** @type {((inputs: Ticket_New_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_title(inputs)
	return en_ticket_new_title(inputs)
});