/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Status_ClosedInputs */

const en_tickets_status_closed = /** @type {(inputs: Tickets_Status_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`closed`)
};

const es_tickets_status_closed = /** @type {(inputs: Tickets_Status_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`cerrado`)
};

const en_xa2_tickets_status_closed = /** @type {(inputs: Tickets_Status_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦clòsèd ••⟧`)
};

/**
* | output |
* | --- |
* | "closed" |
*
* @param {Tickets_Status_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_status_closed = /** @type {((inputs?: Tickets_Status_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Status_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_status_closed(inputs)
	if (locale === "en-XA") return en_xa2_tickets_status_closed(inputs)
	return en_tickets_status_closed(inputs)
});