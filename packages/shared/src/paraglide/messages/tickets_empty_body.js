/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown>, ticket: NonNullable<unknown> }} Tickets_Empty_BodyInputs */

const en_tickets_empty_body = /** @type {(inputs: Tickets_Empty_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`When a ${i?.client} reaches out, their ${i?.ticket} shows up here.`)
};

const es_tickets_empty_body = /** @type {(inputs: Tickets_Empty_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cuando un ${i?.client} se comunique, su ${i?.ticket} aparecerá aquí.`)
};

/**
* | output |
* | --- |
* | "When a {client} reaches out, their {ticket} shows up here." |
*
* @param {Tickets_Empty_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_empty_body = /** @type {((inputs: Tickets_Empty_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Empty_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_empty_body(inputs)
	return es_tickets_empty_body(inputs)
});