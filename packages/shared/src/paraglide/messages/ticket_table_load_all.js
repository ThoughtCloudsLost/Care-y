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

const en_xa2_ticket_table_load_all = /** @type {(inputs: Ticket_Table_Load_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàd àll tò sòrt còmplètèly •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Load all to sort completely" |
*
* @param {Ticket_Table_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_load_all = /** @type {((inputs?: Ticket_Table_Load_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Load_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_table_load_all(inputs)
	if (locale === "en-XA") return en_xa2_ticket_table_load_all(inputs)
	return en_ticket_table_load_all(inputs)
});