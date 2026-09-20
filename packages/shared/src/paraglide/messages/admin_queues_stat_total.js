/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, queues: NonNullable<unknown> }} Admin_Queues_Stat_TotalInputs */

const en_admin_queues_stat_total = /** @type {(inputs: Admin_Queues_Stat_TotalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queues}`)
};

const es_admin_queues_stat_total = /** @type {(inputs: Admin_Queues_Stat_TotalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queues}`)
};

const en_xa2_admin_queues_stat_total = /** @type {(inputs: Admin_Queues_Stat_TotalInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}  •${i?.queues}⟧`)
};

/**
* | output |
* | --- |
* | "{count} {queues}" |
*
* @param {Admin_Queues_Stat_TotalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_stat_total = /** @type {((inputs: Admin_Queues_Stat_TotalInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Stat_TotalInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_stat_total(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_stat_total(inputs)
	return en_admin_queues_stat_total(inputs)
});