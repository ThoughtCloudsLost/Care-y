/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Delete_Confirm_TitleInputs */

const en_library_delete_confirm_title = /** @type {(inputs: Library_Delete_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete articles`)
};

const es_library_delete_confirm_title = /** @type {(inputs: Library_Delete_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar artículos`)
};

const en_xa2_library_delete_confirm_title = /** @type {(inputs: Library_Delete_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè àrtìclès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete articles" |
*
* @param {Library_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_delete_confirm_title = /** @type {((inputs?: Library_Delete_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Delete_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_delete_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_library_delete_confirm_title(inputs)
	return en_library_delete_confirm_title(inputs)
});