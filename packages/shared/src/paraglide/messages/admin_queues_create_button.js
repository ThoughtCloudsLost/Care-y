/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queues_Create_ButtonInputs */

const en_admin_queues_create_button = /** @type {(inputs: Admin_Queues_Create_ButtonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create ${i?.queue}`)
};

const es_admin_queues_create_button = /** @type {(inputs: Admin_Queues_Create_ButtonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear ${i?.queue}`)
};

/**
* | output |
* | --- |
* | "Create {queue}" |
*
* @param {Admin_Queues_Create_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_create_button = /** @type {((inputs: Admin_Queues_Create_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queues_Create_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queues_create_button(inputs)
	return es_admin_queues_create_button(inputs)
});