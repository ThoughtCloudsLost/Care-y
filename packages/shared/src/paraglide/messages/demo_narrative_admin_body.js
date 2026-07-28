/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_BodyInputs */

const en_demo_narrative_admin_body = /** @type {(inputs: Demo_Narrative_Admin_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The admin hub shows how many volunteers, queues, phone lines, greetings, and SMS templates the organization has. Administrators can navigate to volunteer management, queue configuration, and other settings from here. All counts are real queries against the demo database.`)
};

const es_demo_narrative_admin_body = /** @type {(inputs: Demo_Narrative_Admin_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El centro de administracion muestra cuantos voluntarios, colas, lineas telefonicas, saludos y plantillas SMS tiene la organizacion. Los administradores pueden navegar a la gestion de voluntarios, configuracion de colas y otros ajustes desde aqui. Todos los conteos son consultas reales contra la base de datos del demo.`)
};

/**
* | output |
* | --- |
* | "The admin hub shows how many volunteers, queues, phone lines, greetings, and SMS templates the organization has. Administrators can navigate to volunteer man..." |
*
* @param {Demo_Narrative_Admin_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_body = /** @type {((inputs?: Demo_Narrative_Admin_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_body(inputs)
	return es_demo_narrative_admin_body(inputs)
});