/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Attach_FileInputs */

const en_ticket_attach_file = /** @type {(inputs: Ticket_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Attach file`)
};

const es_ticket_attach_file = /** @type {(inputs: Ticket_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adjuntar archivo`)
};

const en_xa2_ticket_attach_file = /** @type {(inputs: Ticket_Attach_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àttàch fìlè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Attach file" |
*
* @param {Ticket_Attach_FileInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_attach_file = /** @type {((inputs?: Ticket_Attach_FileInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Attach_FileInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_attach_file(inputs)
	if (locale === "en-XA") return en_xa2_ticket_attach_file(inputs)
	return en_ticket_attach_file(inputs)
});