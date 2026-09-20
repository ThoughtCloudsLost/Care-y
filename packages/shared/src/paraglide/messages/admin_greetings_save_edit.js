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

const en_xa2_admin_greetings_save_edit = /** @type {(inputs: Admin_Greetings_Save_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè chàngès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Greetings_Save_EditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_save_edit = /** @type {((inputs?: Admin_Greetings_Save_EditInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Save_EditInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_save_edit(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_save_edit(inputs)
	return en_admin_greetings_save_edit(inputs)
});