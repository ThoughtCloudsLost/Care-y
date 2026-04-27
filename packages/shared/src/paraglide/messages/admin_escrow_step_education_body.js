/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Step_Education_BodyInputs */

const en_admin_escrow_step_education_body = /** @type {(inputs: Admin_Escrow_Step_Education_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your organization's data is encrypted with a key that only your team can access. If all administrators lose access to their accounts, this file is the only way to recover that key.`)
};

const es_admin_escrow_step_education_body = /** @type {(inputs: Admin_Escrow_Step_Education_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los datos de su organizacion estan cifrados con una clave a la que solo su equipo tiene acceso. Si todos los administradores pierden el acceso a sus cuentas, este archivo es la unica forma de recuperar esa clave.`)
};

/**
* | output |
* | --- |
* | "Your organization's data is encrypted with a key that only your team can access. If all administrators lose access to their accounts, this file is the only w..." |
*
* @param {Admin_Escrow_Step_Education_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_education_body = /** @type {((inputs?: Admin_Escrow_Step_Education_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Step_Education_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_step_education_body(inputs)
	return es_admin_escrow_step_education_body(inputs)
});