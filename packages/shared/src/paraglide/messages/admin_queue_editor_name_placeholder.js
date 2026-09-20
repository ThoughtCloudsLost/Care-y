/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Editor_Name_PlaceholderInputs */

const en_admin_queue_editor_name_placeholder = /** @type {(inputs: Admin_Queue_Editor_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. General Intake`)
};

const es_admin_queue_editor_name_placeholder = /** @type {(inputs: Admin_Queue_Editor_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ej. Recepción General`)
};

const en_xa2_admin_queue_editor_name_placeholder = /** @type {(inputs: Admin_Queue_Editor_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦è.g. Gènèràl Ìntàkè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "e.g. General Intake" |
*
* @param {Admin_Queue_Editor_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_name_placeholder = /** @type {((inputs?: Admin_Queue_Editor_Name_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Name_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_name_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_name_placeholder(inputs)
	return en_admin_queue_editor_name_placeholder(inputs)
});