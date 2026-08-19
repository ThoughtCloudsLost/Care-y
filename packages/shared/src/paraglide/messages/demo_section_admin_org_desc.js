/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Org_DescInputs */

const en_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization page holds settings that shape the whole workspace. General info, branding, and terminology are encrypted with the organization key before storage. Encryption key escrow and the data retention policy come next, and the note types volunteers use on tickets are defined at the end of the page. A row of section buttons under the title jumps to any section.`)
};

const es_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pagina de organizacion contiene los ajustes que dan forma a todo el espacio de trabajo. La informacion general, la marca y la terminologia se cifran con la clave de la organizacion antes de almacenarse. El deposito de claves de cifrado y la politica de retencion de datos vienen despues, y los tipos de nota que los voluntarios usan en los tickets se definen al final de la pagina. Una fila de botones de seccion debajo del titulo salta a cualquier seccion.`)
};

/**
* | output |
* | --- |
* | "The organization page holds settings that shape the whole workspace. General info, branding, and terminology are encrypted with the organization key before s..." |
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