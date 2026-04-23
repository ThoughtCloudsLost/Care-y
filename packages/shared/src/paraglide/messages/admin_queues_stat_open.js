/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Queues_Stat_OpenInputs */

const en_admin_queues_stat_open = /** @type {(inputs: Admin_Queues_Stat_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open`)
};

const es_admin_queues_stat_open = /** @type {(inputs: Admin_Queues_Stat_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} abiertos`)
};

/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Admin_Queues_Stat_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_stat_open = /** @type {((inputs: Admin_Queues_Stat_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Stat_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_stat_open(inputs)
	return es_admin_queues_stat_open(inputs)
});