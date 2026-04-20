/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Edit_TitleInputs */

const en_admin_greetings_edit_title = /** @type {(inputs: Admin_Greetings_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit greeting`)
};

const es_admin_greetings_edit_title = /** @type {(inputs: Admin_Greetings_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar saludo`)
};

/**
* | output |
* | --- |
* | "Edit greeting" |
*
* @param {Admin_Greetings_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_edit_title = /** @type {((inputs?: Admin_Greetings_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_edit_title(inputs)
	return es_admin_greetings_edit_title(inputs)
});