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

const en_xa2_admin_queues_stat_open = /** @type {(inputs: Admin_Queues_Stat_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òpèn ••⟧`)
};

/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Admin_Queues_Stat_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_stat_open = /** @type {((inputs: Admin_Queues_Stat_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Stat_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_stat_open(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_stat_open(inputs)
	return en_admin_queues_stat_open(inputs)
});