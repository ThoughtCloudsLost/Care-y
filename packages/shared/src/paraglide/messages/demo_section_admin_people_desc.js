/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_People_DescInputs */

const en_demo_section_admin_people_desc = /** @type {(inputs: Demo_Section_Admin_People_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The people page covers everyone the organization works with and how they are organized. It holds the user roster, role and permission configuration, queue management, and the client list, and both client identifiers and queue names are encrypted before they reach the database.`)
};

const es_demo_section_admin_people_desc = /** @type {(inputs: Demo_Section_Admin_People_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de personas cubre a todas las personas con las que trabaja la organización y cómo se organizan. Contiene el directorio de usuarios, la configuración de roles y permisos, la gestión de colas y la lista de clientes, y tanto los identificadores de clientes como los nombres de las colas se cifran antes de llegar a la base de datos.`)
};

/**
* | output |
* | --- |
* | "The people page covers everyone the organization works with and how they are organized. It holds the user roster, role and permission configuration, queue ma..." |
*
* @param {Demo_Section_Admin_People_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_people_desc = /** @type {((inputs?: Demo_Section_Admin_People_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_People_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_people_desc(inputs)
	return en_demo_section_admin_people_desc(inputs)
});