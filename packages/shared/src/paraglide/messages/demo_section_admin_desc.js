/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_DescInputs */

const en_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The admin hub is the landing page for organization management. It groups the management pages into People, Communications, Organization, and Analytics cards, each showing a live count from the database. Administrators see every card. Managers see a subset based on their permissions.`)
};

const es_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El centro de administracion es la pagina de inicio de la gestion de la organizacion. Agrupa las paginas de gestion en tarjetas de Personas, Comunicaciones, Organizacion y Analiticas, cada una con un conteo en vivo de la base de datos. Los administradores ven todas las tarjetas. Los gestores ven un subconjunto segun sus permisos.`)
};

/**
* | output |
* | --- |
* | "The admin hub is the landing page for organization management. It groups the management pages into People, Communications, Organization, and Analytics cards,..." |
*
* @param {Demo_Section_Admin_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_desc = /** @type {((inputs?: Demo_Section_Admin_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_admin_desc(inputs)
	return es_demo_section_admin_desc(inputs)
});