/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Rotation_Dialog_BodyInputs */

const en_admin_rotation_dialog_body = /** @type {(inputs: Admin_Rotation_Dialog_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This creates a new encryption key for your organization's shared data and re-encrypts existing records under it. All ${i?.count} active volunteers will receive the updated key on their next login. Keep this page open while records are secured; anything left over finishes automatically the next time you sign in.`)
};

const es_admin_rotation_dialog_body = /** @type {(inputs: Admin_Rotation_Dialog_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esto crea una nueva clave de cifrado para los datos compartidos de tu organización y vuelve a cifrar los registros existentes con ella. Los ${i?.count} voluntarios activos recibirán la clave actualizada en su próximo inicio de sesión. Mantén esta página abierta mientras se protegen los registros; lo que quede pendiente se completará automáticamente la próxima vez que inicies sesión.`)
};

/**
* | output |
* | --- |
* | "This creates a new encryption key for your organization's shared data and re-encrypts existing records under it. All {count} active volunteers will receive t..." |
*
* @param {Admin_Rotation_Dialog_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_body = /** @type {((inputs: Admin_Rotation_Dialog_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Dialog_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_dialog_body(inputs)
	return en_admin_rotation_dialog_body(inputs)
});