/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_Hold_RemovedInputs */

const en_ticket_system_hold_removed = /** @type {(inputs: Ticket_System_Hold_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Removed from hold`)
};

const es_ticket_system_hold_removed = /** @type {(inputs: Ticket_System_Hold_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retirado de espera`)
};

const en_xa2_ticket_system_hold_removed = /** @type {(inputs: Ticket_System_Hold_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvèd fròm hòld ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Removed from hold" |
*
* @param {Ticket_System_Hold_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_hold_removed = /** @type {((inputs?: Ticket_System_Hold_RemovedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Hold_RemovedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_system_hold_removed(inputs)
	if (locale === "en-XA") return en_xa2_ticket_system_hold_removed(inputs)
	return en_ticket_system_hold_removed(inputs)
});