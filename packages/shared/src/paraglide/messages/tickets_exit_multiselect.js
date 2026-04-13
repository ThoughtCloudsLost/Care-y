/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Exit_MultiselectInputs */

const en_tickets_exit_multiselect = /** @type {(inputs: Tickets_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exit selection mode`)
};

const es_tickets_exit_multiselect = /** @type {(inputs: Tickets_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salir del modo de seleccion`)
};

/**
* | output |
* | --- |
* | "Exit selection mode" |
*
* @param {Tickets_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_exit_multiselect = /** @type {((inputs?: Tickets_Exit_MultiselectInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Exit_MultiselectInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_exit_multiselect(inputs)
	return es_tickets_exit_multiselect(inputs)
});