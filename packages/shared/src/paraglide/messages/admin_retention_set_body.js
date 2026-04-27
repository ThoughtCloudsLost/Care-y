/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ days: NonNullable<unknown> }} Admin_Retention_Set_BodyInputs */

const en_admin_retention_set_body = /** @type {(inputs: Admin_Retention_Set_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tickets, messages, and caller personal information older than ${i?.days} days will be permanently and automatically deleted. This cannot be undone. Deleted data cannot be recovered, even with the escrow file.`)
};

const es_admin_retention_set_body = /** @type {(inputs: Admin_Retention_Set_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los tickets, mensajes e informacion personal de los llamantes con mas de ${i?.days} dias se eliminaran permanente y automaticamente. Esto no se puede deshacer. Los datos eliminados no se pueden recuperar, ni siquiera con el archivo de custodia.`)
};

/**
* | output |
* | --- |
* | "Tickets, messages, and caller personal information older than {days} days will be permanently and automatically deleted. This cannot be undone. Deleted data ..." |
*
* @param {Admin_Retention_Set_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_set_body = /** @type {((inputs: Admin_Retention_Set_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Set_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_set_body(inputs)
	return es_admin_retention_set_body(inputs)
});