/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, queues: NonNullable<unknown> }} Admin_Hub_Badge_QueuesInputs */

const en_admin_hub_badge_queues = /** @type {(inputs: Admin_Hub_Badge_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queues}`)
};

const es_admin_hub_badge_queues = /** @type {(inputs: Admin_Hub_Badge_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queues}`)
};

/**
* | output |
* | --- |
* | "{count} {queues}" |
*
* @param {Admin_Hub_Badge_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_queues = /** @type {((inputs: Admin_Hub_Badge_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_queues(inputs)
	return es_admin_hub_badge_queues(inputs)
});