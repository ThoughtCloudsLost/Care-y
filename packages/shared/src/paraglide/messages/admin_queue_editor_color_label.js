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

const en_xa2_admin_queue_editor_color_label = /** @type {(inputs: Admin_Queue_Editor_Color_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còlòr ••⟧`)
};

/**
* | output |
* | --- |
* | "Color" |
*
* @param {Admin_Queue_Editor_Color_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_color_label = /** @type {((inputs?: Admin_Queue_Editor_Color_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Color_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_color_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_color_label(inputs)
	return en_admin_queue_editor_color_label(inputs)
});