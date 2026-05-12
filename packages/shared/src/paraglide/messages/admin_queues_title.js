/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queues: NonNullable<unknown> }} Admin_Queues_TitleInputs */

const en_admin_queues_title = /** @type {(inputs: Admin_Queues_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

const es_admin_queues_title = /** @type {(inputs: Admin_Queues_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

/**
* | output |
* | --- |
* | "{Queues}" |
*
* @param {Admin_Queues_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_title = /** @type {((inputs: Admin_Queues_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_title(inputs)
	return es_admin_queues_title(inputs)
});