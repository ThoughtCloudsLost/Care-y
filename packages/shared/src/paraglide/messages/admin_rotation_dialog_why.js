/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_Dialog_WhyInputs */

const en_admin_rotation_dialog_why = /** @type {(inputs: Admin_Rotation_Dialog_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotate your key if a team member leaves the organization, if you suspect unauthorized access, or as part of a regular security schedule.`)
};

const es_admin_rotation_dialog_why = /** @type {(inputs: Admin_Rotation_Dialog_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rota tu clave si un miembro del equipo deja la organizacion, si sospechas acceso no autorizado, o como parte de un calendario regular de seguridad.`)
};

/**
* | output |
* | --- |
* | "Rotate your key if a team member leaves the organization, if you suspect unauthorized access, or as part of a regular security schedule." |
*
* @param {Admin_Rotation_Dialog_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_why = /** @type {((inputs?: Admin_Rotation_Dialog_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Dialog_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_dialog_why(inputs)
	return es_admin_rotation_dialog_why(inputs)
});