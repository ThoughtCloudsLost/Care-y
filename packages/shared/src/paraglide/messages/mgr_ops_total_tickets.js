/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Mgr_Ops_Total_TicketsInputs */

const en_mgr_ops_total_tickets = /** @type {(inputs: Mgr_Ops_Total_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open tickets`)
};

const es_mgr_ops_total_tickets = /** @type {(inputs: Mgr_Ops_Total_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} tickets abiertos`)
};

/**
* | output |
* | --- |
* | "{count} open tickets" |
*
* @param {Mgr_Ops_Total_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_ops_total_tickets = /** @type {((inputs: Mgr_Ops_Total_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Ops_Total_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_ops_total_tickets(inputs)
	return es_mgr_ops_total_tickets(inputs)
});