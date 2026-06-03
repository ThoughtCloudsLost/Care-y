/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Admin_Users_Filter_QueueInputs */

const en_admin_users_filter_queue = /** @type {(inputs: Admin_Users_Filter_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const es_admin_users_filter_queue = /** @type {(inputs: Admin_Users_Filter_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Admin_Users_Filter_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_filter_queue = /** @type {((inputs: Admin_Users_Filter_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Filter_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_filter_queue(inputs)
	return es_admin_users_filter_queue(inputs)
});