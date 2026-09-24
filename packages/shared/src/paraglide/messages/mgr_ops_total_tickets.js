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

const en_xa2_mgr_ops_total_tickets = /** @type {(inputs: Mgr_Ops_Total_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òpèn tìckèts ••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} open tickets" |
*
* @param {Mgr_Ops_Total_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_ops_total_tickets = /** @type {((inputs: Mgr_Ops_Total_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Ops_Total_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_ops_total_tickets(inputs)
	if (locale === "en-XA") return en_xa2_mgr_ops_total_tickets(inputs)
	return en_mgr_ops_total_tickets(inputs)
});