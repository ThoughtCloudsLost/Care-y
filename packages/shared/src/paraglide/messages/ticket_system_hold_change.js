/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_Hold_ChangeInputs */

const en_ticket_system_hold_change = /** @type {(inputs: Ticket_System_Hold_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hold changed`)
};

const es_ticket_system_hold_change = /** @type {(inputs: Ticket_System_Hold_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Espera cambiada`)
};

/**
* | output |
* | --- |
* | "Hold changed" |
*
* @param {Ticket_System_Hold_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_hold_change = /** @type {((inputs?: Ticket_System_Hold_ChangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Hold_ChangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_hold_change(inputs)
	return es_ticket_system_hold_change(inputs)
});