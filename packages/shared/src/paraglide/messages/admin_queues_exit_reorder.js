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

const en_xa2_admin_queues_exit_reorder = /** @type {(inputs: Admin_Queues_Exit_ReorderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònè ••⟧`)
};

/**
* | output |
* | --- |
* | "Done" |
*
* @param {Admin_Queues_Exit_ReorderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_exit_reorder = /** @type {((inputs?: Admin_Queues_Exit_ReorderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Exit_ReorderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_exit_reorder(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_exit_reorder(inputs)
	return en_admin_queues_exit_reorder(inputs)
});