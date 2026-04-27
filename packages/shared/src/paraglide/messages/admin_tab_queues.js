/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_QueuesInputs */

const en_admin_tab_queues = /** @type {(inputs: Admin_Tab_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues`)
};

const es_admin_tab_queues = /** @type {(inputs: Admin_Tab_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Colas`)
};

/**
* | output |
* | --- |
* | "Queues" |
*
* @param {Admin_Tab_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_queues = /** @type {((inputs?: Admin_Tab_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_queues(inputs)
	return es_admin_tab_queues(inputs)
});