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

const en_xa2_admin_terminology_desc_kb = /** @type {(inputs: Admin_Terminology_Desc_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntèrnàl rèfèrèncè màtèrìàls àvàìlàblè tò tèàm mèmbèrs. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Internal reference materials available to team members." |
*
* @param {Admin_Terminology_Desc_KbInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_kb = /** @type {((inputs?: Admin_Terminology_Desc_KbInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_KbInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_desc_kb(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_desc_kb(inputs)
	return en_admin_terminology_desc_kb(inputs)
});