/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_UnassignedInputs */

const en_tickets_unassigned = /** @type {(inputs: Tickets_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unassigned`)
};

const es_tickets_unassigned = /** @type {(inputs: Tickets_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin asignar`)
};

const en_xa2_tickets_unassigned = /** @type {(inputs: Tickets_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnàssìgnèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Unassigned" |
*
* @param {Tickets_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_unassigned = /** @type {((inputs?: Tickets_UnassignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_UnassignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_unassigned(inputs)
	if (locale === "en-XA") return en_xa2_tickets_unassigned(inputs)
	return en_tickets_unassigned(inputs)
});