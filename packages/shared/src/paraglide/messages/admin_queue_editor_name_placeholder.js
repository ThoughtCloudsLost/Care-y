/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Editor_Name_PlaceholderInputs */

const en_admin_queue_editor_name_placeholder = /** @type {(inputs: Admin_Queue_Editor_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. General Intake`)
};

const es_admin_queue_editor_name_placeholder = /** @type {(inputs: Admin_Queue_Editor_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ej. Recepcion General`)
};

/**
* | output |
* | --- |
* | "e.g. General Intake" |
*
* @param {Admin_Queue_Editor_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_name_placeholder = /** @type {((inputs?: Admin_Queue_Editor_Name_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Name_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_name_placeholder(inputs)
	return es_admin_queue_editor_name_placeholder(inputs)
});