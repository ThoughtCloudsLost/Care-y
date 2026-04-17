/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Editor_Create_TitleInputs */

const en_admin_queue_editor_create_title = /** @type {(inputs: Admin_Queue_Editor_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Queue`)
};

const es_admin_queue_editor_create_title = /** @type {(inputs: Admin_Queue_Editor_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cola`)
};

/**
* | output |
* | --- |
* | "Create Queue" |
*
* @param {Admin_Queue_Editor_Create_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_create_title = /** @type {((inputs?: Admin_Queue_Editor_Create_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Create_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_create_title(inputs)
	return es_admin_queue_editor_create_title(inputs)
});