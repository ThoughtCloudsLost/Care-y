/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Deactivate_BodyInputs */

const en_admin_deactivate_body = /** @type {(inputs: Admin_Deactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`They will be logged out immediately and lose access to organization data. To restore access later, you will need to reactivate their account and re-share the organization key.`)
};

const es_admin_deactivate_body = /** @type {(inputs: Admin_Deactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se cerrara su sesion inmediatamente y perdera acceso a los datos de la organizacion. Para restaurar el acceso, debera reactivar su cuenta y compartir la clave de organizacion nuevamente.`)
};

/**
* | output |
* | --- |
* | "They will be logged out immediately and lose access to organization data. To restore access later, you will need to reactivate their account and re-share the..." |
*
* @param {Admin_Deactivate_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_body = /** @type {((inputs?: Admin_Deactivate_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Deactivate_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_deactivate_body(inputs)
	return es_admin_deactivate_body(inputs)
});