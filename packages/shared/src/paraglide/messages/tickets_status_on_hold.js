/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Status_On_HoldInputs */

const en_tickets_status_on_hold = /** @type {(inputs: Tickets_Status_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`on hold`)
};

const es_tickets_status_on_hold = /** @type {(inputs: Tickets_Status_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`en espera`)
};

const en_xa2_tickets_status_on_hold = /** @type {(inputs: Tickets_Status_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦òn hòld •••⟧`)
};

/**
* | output |
* | --- |
* | "on hold" |
*
* @param {Tickets_Status_On_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_status_on_hold = /** @type {((inputs?: Tickets_Status_On_HoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Status_On_HoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_status_on_hold(inputs)
	if (locale === "en-XA") return en_xa2_tickets_status_on_hold(inputs)
	return en_tickets_status_on_hold(inputs)
});