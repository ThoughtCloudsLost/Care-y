/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_People_DescInputs */

const en_demo_section_admin_people_desc = /** @type {(inputs: Demo_Section_Admin_People_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The people page manages everyone the organization works with. Administrators maintain the volunteer roster and roles, configure the queues that organize and route tickets, and review the client list. Client identifiers and queue names are encrypted before they reach the database.`)
};

const es_demo_section_admin_people_desc = /** @type {(inputs: Demo_Section_Admin_People_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pagina de personas gestiona a todas las personas con las que trabaja la organizacion. Los administradores mantienen el registro de voluntarios y sus roles, configuran las colas que organizan y enrutan los tickets, y revisan la lista de clientes. Los identificadores de clientes y los nombres de las colas se cifran antes de llegar a la base de datos.`)
};

/**
* | output |
* | --- |
* | "The people page manages everyone the organization works with. Administrators maintain the volunteer roster and roles, configure the queues that organize and ..." |
*
* @param {Demo_Section_Admin_People_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_people_desc = /** @type {((inputs?: Demo_Section_Admin_People_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_People_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_admin_people_desc(inputs)
	return es_demo_section_admin_people_desc(inputs)
});