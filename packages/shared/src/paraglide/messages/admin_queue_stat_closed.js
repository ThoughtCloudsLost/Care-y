/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Queue_Stat_ClosedInputs */

const en_admin_queue_stat_closed = /** @type {(inputs: Admin_Queue_Stat_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} closed`)
};

const es_admin_queue_stat_closed = /** @type {(inputs: Admin_Queue_Stat_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} cerrados`)
};

/**
* | output |
* | --- |
* | "{count} closed" |
*
* @param {Admin_Queue_Stat_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_stat_closed = /** @type {((inputs: Admin_Queue_Stat_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Stat_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_stat_closed(inputs)
	return es_admin_queue_stat_closed(inputs)
});