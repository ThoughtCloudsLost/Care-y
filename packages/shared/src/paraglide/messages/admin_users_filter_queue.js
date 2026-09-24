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

const en_xa2_admin_users_filter_queue = /** @type {(inputs: Admin_Users_Filter_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Admin_Users_Filter_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_filter_queue = /** @type {((inputs: Admin_Users_Filter_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Filter_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_filter_queue(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_filter_queue(inputs)
	return en_admin_users_filter_queue(inputs)
});