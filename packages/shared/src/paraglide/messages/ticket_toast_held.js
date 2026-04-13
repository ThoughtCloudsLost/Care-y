/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Toast_HeldInputs */

const en_ticket_toast_held = /** @type {(inputs: Ticket_Toast_HeldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket placed on hold`)
};

const es_ticket_toast_held = /** @type {(inputs: Ticket_Toast_HeldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket puesto en espera`)
};

/**
* | output |
* | --- |
* | "Ticket placed on hold" |
*
* @param {Ticket_Toast_HeldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_held = /** @type {((inputs?: Ticket_Toast_HeldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_HeldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_held(inputs)
	return es_ticket_toast_held(inputs)
});