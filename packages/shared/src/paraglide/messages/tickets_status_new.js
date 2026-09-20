/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Status_NewInputs */

const en_tickets_status_new = /** @type {(inputs: Tickets_Status_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`new`)
};

const es_tickets_status_new = /** @type {(inputs: Tickets_Status_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nuevo`)
};

const en_xa2_tickets_status_new = /** @type {(inputs: Tickets_Status_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦nèw •⟧`)
};

/**
* | output |
* | --- |
* | "new" |
*
* @param {Tickets_Status_NewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_status_new = /** @type {((inputs?: Tickets_Status_NewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Status_NewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_status_new(inputs)
	if (locale === "en-XA") return en_xa2_tickets_status_new(inputs)
	return en_tickets_status_new(inputs)
});