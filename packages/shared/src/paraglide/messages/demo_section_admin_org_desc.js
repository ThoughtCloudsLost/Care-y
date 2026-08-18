/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Org_DescInputs */

const en_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization page holds settings that shape the whole workspace. General info, branding, terminology, and note types are encrypted with the organization key before storage. Encryption key escrow and the data retention policy are also configured here.`)
};

const es_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pagina de organizacion contiene los ajustes que dan forma a todo el espacio de trabajo. La informacion general, la marca, la terminologia y los tipos de nota se cifran con la clave de la organizacion antes de almacenarse. El deposito de claves de cifrado y la politica de retencion de datos tambien se configuran aqui.`)
};

/**
* | output |
* | --- |
* | "The organization page holds settings that shape the whole workspace. General info, branding, terminology, and note types are encrypted with the organization ..." |
*
* @param {Demo_Section_Admin_Org_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_org_desc = /** @type {((inputs?: Demo_Section_Admin_Org_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Org_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_admin_org_desc(inputs)
	return es_demo_section_admin_org_desc(inputs)
});