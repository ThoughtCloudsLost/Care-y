/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Editor_Color_LabelInputs */

const en_admin_queue_editor_color_label = /** @type {(inputs: Admin_Queue_Editor_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color`)
};

const es_admin_queue_editor_color_label = /** @type {(inputs: Admin_Queue_Editor_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color`)
};

/**
* | output |
* | --- |
* | "Color" |
*
* @param {Admin_Queue_Editor_Color_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_color_label = /** @type {((inputs?: Admin_Queue_Editor_Color_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Color_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_color_label(inputs)
	return es_admin_queue_editor_color_label(inputs)
});