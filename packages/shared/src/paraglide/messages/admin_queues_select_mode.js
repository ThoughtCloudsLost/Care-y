/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queues_Select_ModeInputs */

const en_admin_queues_select_mode = /** @type {(inputs: Admin_Queues_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reorder`)
};

const es_admin_queues_select_mode = /** @type {(inputs: Admin_Queues_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reordenar`)
};

const en_xa2_admin_queues_select_mode = /** @type {(inputs: Admin_Queues_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèòrdèr •••⟧`)
};

/**
* | output |
* | --- |
* | "Reorder" |
*
* @param {Admin_Queues_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_select_mode = /** @type {((inputs?: Admin_Queues_Select_ModeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Select_ModeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queues_select_mode(inputs)
	if (locale === "en-XA") return en_xa2_admin_queues_select_mode(inputs)
	return en_admin_queues_select_mode(inputs)
});