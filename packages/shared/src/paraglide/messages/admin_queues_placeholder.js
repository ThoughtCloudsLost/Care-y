/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queues: NonNullable<unknown> }} Admin_Queues_PlaceholderInputs */

const en_admin_queues_placeholder = /** @type {(inputs: Admin_Queues_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} management loading...`)
};

const es_admin_queues_placeholder = /** @type {(inputs: Admin_Queues_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cargando gestion de ${i?.queues}...`)
};

/**
* | output |
* | --- |
* | "{Queue} management loading..." |
*
* @param {Admin_Queues_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_placeholder = /** @type {((inputs: Admin_Queues_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_placeholder(inputs)
	return es_admin_queues_placeholder(inputs)
});