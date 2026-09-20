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

const en_xa2_tickets_status_active = /** @type {(inputs: Tickets_Status_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦àctìvè ••⟧`)
};

/**
* | output |
* | --- |
* | "active" |
*
* @param {Tickets_Status_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_status_active = /** @type {((inputs?: Tickets_Status_ActiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Status_ActiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_status_active(inputs)
	if (locale === "en-XA") return en_xa2_tickets_status_active(inputs)
	return en_tickets_status_active(inputs)
});