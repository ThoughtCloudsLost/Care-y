/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Load_AllInputs */

const en_ticket_table_load_all = /** @type {(inputs: Ticket_Table_Load_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load all to sort completely`)
};

const es_ticket_table_load_all = /** @type {(inputs: Ticket_Table_Load_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar todo para ordenar completamente`)
};

/**
* | output |
* | --- |
* | "Load all to sort completely" |
*
* @param {Ticket_Table_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_load_all = /** @type {((inputs?: Ticket_Table_Load_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Load_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_table_load_all(inputs)
	return es_ticket_table_load_all(inputs)
});