/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Delete_ConfirmInputs */

const en_admin_greetings_delete_confirm = /** @type {(inputs: Admin_Greetings_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Are you sure you want to remove this greeting?`)
};

const es_admin_greetings_delete_confirm = /** @type {(inputs: Admin_Greetings_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Está seguro de que desea eliminar este saludo?`)
};

const en_xa2_admin_greetings_delete_confirm = /** @type {(inputs: Admin_Greetings_Delete_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àrè yòù sùrè yòù wànt tò rèmòvè thìs grèètìng? ••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to remove this greeting?" |
*
* @param {Admin_Greetings_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_delete_confirm = /** @type {((inputs?: Admin_Greetings_Delete_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Delete_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_delete_confirm(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_delete_confirm(inputs)
	return en_admin_greetings_delete_confirm(inputs)
});