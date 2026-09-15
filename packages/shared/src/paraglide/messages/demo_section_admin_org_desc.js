/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Org_DescInputs */

const en_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization page holds settings that shape the whole workspace. General info and branding are stored without encryption so they can appear on pages the visitor sees before signing in, while terminology is encrypted with the organization key. The page also covers encryption key escrow, the data retention policy, and the note types available on tickets.`)
};

const es_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de organización contiene los ajustes que dan forma a todo el espacio de trabajo. La información general y la marca se almacenan sin cifrar para que puedan aparecer en las páginas que el visitante ve antes de iniciar sesión, mientras que la terminología se cifra con la clave de la organización. La página también cubre el depósito de claves de cifrado, la política de retención de datos y los tipos de nota disponibles en los tickets.`)
};

/**
* | output |
* | --- |
* | "The organization page holds settings that shape the whole workspace. General info and branding are stored without encryption so they can appear on pages the ..." |
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