/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_Hold_PlacedInputs */

const en_ticket_system_hold_placed = /** @type {(inputs: Ticket_System_Hold_PlacedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Placed on hold`)
};

const es_ticket_system_hold_placed = /** @type {(inputs: Ticket_System_Hold_PlacedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Puesto en espera`)
};

/**
* | output |
* | --- |
* | "Placed on hold" |
*
* @param {Ticket_System_Hold_PlacedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_hold_placed = /** @type {((inputs?: Ticket_System_Hold_PlacedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Hold_PlacedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_hold_placed(inputs)
	return es_ticket_system_hold_placed(inputs)
});