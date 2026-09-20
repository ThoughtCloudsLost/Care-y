/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Delete_TitleInputs */

const en_admin_greetings_delete_title = /** @type {(inputs: Admin_Greetings_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete greeting`)
};

const es_admin_greetings_delete_title = /** @type {(inputs: Admin_Greetings_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar saludo`)
};

const en_xa2_admin_greetings_delete_title = /** @type {(inputs: Admin_Greetings_Delete_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè grèètìng •••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete greeting" |
*
* @param {Admin_Greetings_Delete_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_delete_title = /** @type {((inputs?: Admin_Greetings_Delete_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Delete_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_delete_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_delete_title(inputs)
	return en_admin_greetings_delete_title(inputs)
});