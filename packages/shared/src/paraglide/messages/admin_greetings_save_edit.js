/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Save_EditInputs */

const en_admin_greetings_save_edit = /** @type {(inputs: Admin_Greetings_Save_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save changes`)
};

const es_admin_greetings_save_edit = /** @type {(inputs: Admin_Greetings_Save_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar cambios`)
};

/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Greetings_Save_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_save_edit = /** @type {((inputs?: Admin_Greetings_Save_EditInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Save_EditInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_save_edit(inputs)
	return es_admin_greetings_save_edit(inputs)
});