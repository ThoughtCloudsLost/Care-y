/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queues: NonNullable<unknown> }} Admin_Tab_QueuesInputs */

const en_admin_tab_queues = /** @type {(inputs: Admin_Tab_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

const es_admin_tab_queues = /** @type {(inputs: Admin_Tab_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

const en_xa2_admin_tab_queues = /** @type {(inputs: Admin_Tab_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queues}⟧`)
};

/**
* | output |
* | --- |
* | "{Queues}" |
*
* @param {Admin_Tab_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_queues = /** @type {((inputs: Admin_Tab_QueuesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_QueuesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_queues(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_queues(inputs)
	return en_admin_tab_queues(inputs)
});