/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Volunteers: NonNullable<unknown> }} Admin_Presets_Delete_ConfirmInputs */

const en_admin_presets_delete_confirm = /** @type {(inputs: Admin_Presets_Delete_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Are you sure you want to remove this saved reply? ${i?.Volunteers} will no longer see it in the compose bar.`)
};

const es_admin_presets_delete_confirm = /** @type {(inputs: Admin_Presets_Delete_ConfirmInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`¿Está seguro de que desea eliminar esta respuesta guardada? ${i?.Volunteers} ya no la verán en la barra de redacción.`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to remove this saved reply? {Volunteers} will no longer see it in the compose bar." |
*
* @param {Admin_Presets_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_delete_confirm = /** @type {((inputs: Admin_Presets_Delete_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Delete_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_delete_confirm(inputs)
	return en_admin_presets_delete_confirm(inputs)
});