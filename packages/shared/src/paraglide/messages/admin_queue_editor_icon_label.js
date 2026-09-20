/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Editor_Icon_LabelInputs */

const en_admin_queue_editor_icon_label = /** @type {(inputs: Admin_Queue_Editor_Icon_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Icon`)
};

const es_admin_queue_editor_icon_label = /** @type {(inputs: Admin_Queue_Editor_Icon_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Icono`)
};

const en_xa2_admin_queue_editor_icon_label = /** @type {(inputs: Admin_Queue_Editor_Icon_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìcòn ••⟧`)
};

/**
* | output |
* | --- |
* | "Icon" |
*
* @param {Admin_Queue_Editor_Icon_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_icon_label = /** @type {((inputs?: Admin_Queue_Editor_Icon_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Icon_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_icon_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_icon_label(inputs)
	return en_admin_queue_editor_icon_label(inputs)
});