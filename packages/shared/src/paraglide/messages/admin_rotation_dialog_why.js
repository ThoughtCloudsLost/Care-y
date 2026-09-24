/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_Dialog_WhyInputs */

const en_admin_rotation_dialog_why = /** @type {(inputs: Admin_Rotation_Dialog_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotate your key if a team member leaves the organization, if you suspect unauthorized access, or as part of a regular security schedule.`)
};

const es_admin_rotation_dialog_why = /** @type {(inputs: Admin_Rotation_Dialog_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rota tu clave si un miembro del equipo deja la organización, si sospechas acceso no autorizado, o como parte de un calendario regular de seguridad.`)
};

const en_xa2_admin_rotation_dialog_why = /** @type {(inputs: Admin_Rotation_Dialog_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròtàtè yòùr kèy ìf à tèàm mèmbèr lèàvès thè òrgànìzàtìòn, ìf yòù sùspèct ùnàùthòrìzèd àccèss, òr às pàrt òf à règùlàr sècùrìty schèdùlè. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Rotate your key if a team member leaves the organization, if you suspect unauthorized access, or as part of a regular security schedule." |
*
* @param {Admin_Rotation_Dialog_WhyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_why = /** @type {((inputs?: Admin_Rotation_Dialog_WhyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Dialog_WhyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_dialog_why(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_dialog_why(inputs)
	return en_admin_rotation_dialog_why(inputs)
});