/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Exit_ReorderInputs */

const en_admin_queues_exit_reorder = /** @type {(inputs: Admin_Queues_Exit_ReorderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Done`)
};

const es_admin_queues_exit_reorder = /** @type {(inputs: Admin_Queues_Exit_ReorderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listo`)
};

/**
* | output |
* | --- |
* | "Done" |
*
* @param {Admin_Queues_Exit_ReorderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_exit_reorder = /** @type {((inputs?: Admin_Queues_Exit_ReorderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Exit_ReorderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_exit_reorder(inputs)
	return es_admin_queues_exit_reorder(inputs)
});