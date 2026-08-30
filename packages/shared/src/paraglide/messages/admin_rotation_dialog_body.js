/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Rotation_Dialog_BodyInputs */

const en_admin_rotation_dialog_body = /** @type {(inputs: Admin_Rotation_Dialog_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This creates a new encryption key for your organization's shared data: volunteer names, knowledge base articles, queue names, and organization branding. All ${i?.count} active volunteers will receive the updated key on their next login. Ticket conversations and client information use separate, stronger encryption and are not affected by this change.`)
};

const es_admin_rotation_dialog_body = /** @type {(inputs: Admin_Rotation_Dialog_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esto crea una nueva clave de cifrado para los datos compartidos de tu organización: nombres de voluntarios, artículos de la base de conocimiento, nombres de colas y marca de la organización. Los ${i?.count} voluntarios activos recibiran la clave actualizada en su proximo inicio de sesión. Las conversaciones de tickets y la información de clientes usan cifrado separado y más fuerte, y no se ven afectadas por este cambio.`)
};

/**
* | output |
* | --- |
* | "This creates a new encryption key for your organization's shared data: volunteer names, knowledge base articles, queue names, and organization branding. All ..." |
*
* @param {Admin_Rotation_Dialog_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_body = /** @type {((inputs: Admin_Rotation_Dialog_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Dialog_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_dialog_body(inputs)
	return es_admin_rotation_dialog_body(inputs)
});