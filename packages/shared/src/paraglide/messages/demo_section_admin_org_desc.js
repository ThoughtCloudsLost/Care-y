/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Org_DescInputs */

const en_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`These entries cover settings that shape the whole workspace rather than any one ticket or person. General info and branding are stored without encryption so pages the visitor sees before signing in can display them, while terminology is encrypted with the organization key.`)
};

const es_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estas entradas cubren ajustes que dan forma a todo el espacio de trabajo en lugar de a un ticket o una persona en particular. La información general y la marca se almacenan sin cifrar para que las páginas que el visitante ve antes de iniciar sesión puedan mostrarlas, mientras que la terminología se cifra con la clave de la organización.`)
};

/**
* | output |
* | --- |
* | "These entries cover settings that shape the whole workspace rather than any one ticket or person. General info and branding are stored without encryption so ..." |
*
* @param {Demo_Section_Admin_Org_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_org_desc = /** @type {((inputs?: Demo_Section_Admin_Org_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Org_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_org_desc(inputs)
	return en_demo_section_admin_org_desc(inputs)
});