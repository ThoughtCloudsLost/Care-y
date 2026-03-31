/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Status_ActiveInputs */

const en_tickets_status_active = /** @type {(inputs: Tickets_Status_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`active`)
};

const es_tickets_status_active = /** @type {(inputs: Tickets_Status_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`activo`)
};

/**
* | output |
* | --- |
* | "active" |
*
* @param {Tickets_Status_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_status_active = /** @type {((inputs?: Tickets_Status_ActiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Status_ActiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_status_active(inputs)
	return es_tickets_status_active(inputs)
});