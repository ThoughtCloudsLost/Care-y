/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Reorder_ModeInputs */

const en_admin_queues_reorder_mode = /** @type {(inputs: Admin_Queues_Reorder_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reorder mode`)
};

const es_admin_queues_reorder_mode = /** @type {(inputs: Admin_Queues_Reorder_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Modo de reorden`)
};

const en_xa2_admin_queues_reorder_mode = /** @type {(inputs: Admin_Queues_Reorder_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèòrdèr mòdè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Reorder mode" |
*
* @param {Admin_Queues_Reorder_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_reorder_mode = /** @type {((inputs?: Admin_Queues_Reorder_ModeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Reorder_ModeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_reorder_mode(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_reorder_mode(inputs)
	return en_admin_queues_reorder_mode(inputs)
});