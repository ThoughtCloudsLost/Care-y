/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Member_Picker_TitleInputs */

const en_admin_queue_member_picker_title = /** @type {(inputs: Admin_Queue_Member_Picker_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add Member`)
};

const es_admin_queue_member_picker_title = /** @type {(inputs: Admin_Queue_Member_Picker_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar miembro`)
};

/**
* | output |
* | --- |
* | "Add Member" |
*
* @param {Admin_Queue_Member_Picker_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_picker_title = /** @type {((inputs?: Admin_Queue_Member_Picker_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_Picker_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_member_picker_title(inputs)
	return es_admin_queue_member_picker_title(inputs)
});