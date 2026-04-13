/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Toast_UnheldInputs */

const en_ticket_toast_unheld = /** @type {(inputs: Ticket_Toast_UnheldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket removed from hold`)
};

const es_ticket_toast_unheld = /** @type {(inputs: Ticket_Toast_UnheldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket quitado de espera`)
};

/**
* | output |
* | --- |
* | "Ticket removed from hold" |
*
* @param {Ticket_Toast_UnheldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_unheld = /** @type {((inputs?: Ticket_Toast_UnheldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_UnheldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_unheld(inputs)
	return es_ticket_toast_unheld(inputs)
});