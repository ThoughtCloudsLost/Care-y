/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, days: NonNullable<unknown> }} Admin_Retention_Set_BodyInputs */

const en_admin_retention_set_body = /** @type {(inputs: Admin_Retention_Set_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Closed ${i?.tickets} with no activity for more than ${i?.days} days will be permanently deleted, along with their messages, files, and caller personal information. People with open ${i?.tickets} are not affected. This cannot be undone. Deleted data cannot be recovered, even with the escrow file.`)
};

const es_admin_retention_set_body = /** @type {(inputs: Admin_Retention_Set_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los ${i?.tickets} cerrados sin actividad durante más de ${i?.days} días se eliminarán permanentemente, junto con sus mensajes, archivos e información personal de los llamantes. Las personas con ${i?.tickets} abiertos no se ven afectadas. Esto no se puede deshacer. Los datos eliminados no se pueden recuperar, ni siquiera con el archivo de custodia.`)
};

/**
* | output |
* | --- |
* | "Closed {tickets} with no activity for more than {days} days will be permanently deleted, along with their messages, files, and caller personal information. P..." |
*
* @param {Admin_Retention_Set_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_set_body = /** @type {((inputs: Admin_Retention_Set_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Set_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_set_body(inputs)
	return en_admin_retention_set_body(inputs)
});