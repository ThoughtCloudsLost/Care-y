/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Desc_KbInputs */

const en_admin_terminology_desc_kb = /** @type {(inputs: Admin_Terminology_Desc_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal reference materials available to team members.`)
};

const es_admin_terminology_desc_kb = /** @type {(inputs: Admin_Terminology_Desc_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Materiales de referencia internos disponibles para los miembros del equipo.`)
};

/**
* | output |
* | --- |
* | "Internal reference materials available to team members." |
*
* @param {Admin_Terminology_Desc_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_kb = /** @type {((inputs?: Admin_Terminology_Desc_KbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_KbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_desc_kb(inputs)
	return es_admin_terminology_desc_kb(inputs)
});