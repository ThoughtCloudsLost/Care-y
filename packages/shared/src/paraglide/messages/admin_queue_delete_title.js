/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Queue_Delete_TitleInputs */

const en_admin_queue_delete_title = /** @type {(inputs: Admin_Queue_Delete_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Delete ${i?.name}`)
};

const es_admin_queue_delete_title = /** @type {(inputs: Admin_Queue_Delete_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Eliminar ${i?.name}`)
};

const en_xa2_admin_queue_delete_title = /** @type {(inputs: Admin_Queue_Delete_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè  •••${i?.name}⟧`)
};

/**
* | output |
* | --- |
* | "Delete {name}" |
*
* @param {Admin_Queue_Delete_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_title = /** @type {((inputs: Admin_Queue_Delete_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Delete_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_delete_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_delete_title(inputs)
	return en_admin_queue_delete_title(inputs)
});