/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Queue_Stat_HoldInputs */

const en_admin_queue_stat_hold = /** @type {(inputs: Admin_Queue_Stat_HoldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} hold`)
};

const es_admin_queue_stat_hold = /** @type {(inputs: Admin_Queue_Stat_HoldInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} en espera`)
};

/**
* | output |
* | --- |
* | "{count} hold" |
*
* @param {Admin_Queue_Stat_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_stat_hold = /** @type {((inputs: Admin_Queue_Stat_HoldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Stat_HoldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_stat_hold(inputs)
	return es_admin_queue_stat_hold(inputs)
});