/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown>, ticket: NonNullable<unknown> }} Tickets_Unread_Zero_BodyInputs */

const en_tickets_unread_zero_body = /** @type {(inputs: Tickets_Unread_Zero_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`When a ${i?.client} writes back, their ${i?.ticket} shows up here.`)
};

const es_tickets_unread_zero_body = /** @type {(inputs: Tickets_Unread_Zero_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cuando un ${i?.client} vuelva a escribir, su ${i?.ticket} aparecerá aquí.`)
};

const en_xa2_tickets_unread_zero_body = /** @type {(inputs: Tickets_Unread_Zero_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Whèn à  •••${i?.client} wrìtès bàck, thèìr  ••••••${i?.ticket} shòws ùp hèrè. •••••⟧`)
};

/**
* | output |
* | --- |
* | "When a {client} writes back, their {ticket} shows up here." |
*
* @param {Tickets_Unread_Zero_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_unread_zero_body = /** @type {((inputs: Tickets_Unread_Zero_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Unread_Zero_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_unread_zero_body(inputs)
	if (locale === "en-XA") return en_xa2_tickets_unread_zero_body(inputs)
	return en_tickets_unread_zero_body(inputs)
});