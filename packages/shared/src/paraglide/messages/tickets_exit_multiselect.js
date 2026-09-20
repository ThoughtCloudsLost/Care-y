/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Exit_MultiselectInputs */

const en_tickets_exit_multiselect = /** @type {(inputs: Tickets_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exit selection mode`)
};

const es_tickets_exit_multiselect = /** @type {(inputs: Tickets_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salir del modo de selección`)
};

const en_xa2_tickets_exit_multiselect = /** @type {(inputs: Tickets_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxìt sèlèctìòn mòdè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Exit selection mode" |
*
* @param {Tickets_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_exit_multiselect = /** @type {((inputs?: Tickets_Exit_MultiselectInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Exit_MultiselectInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_exit_multiselect(inputs)
	if (locale === "en-XA") return en_xa2_tickets_exit_multiselect(inputs)
	return en_tickets_exit_multiselect(inputs)
});