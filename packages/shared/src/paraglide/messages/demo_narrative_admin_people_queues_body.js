/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_People_Queues_BodyInputs */

const en_demo_narrative_admin_people_queues_body = /** @type {(inputs: Demo_Narrative_Admin_People_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The roster shows every volunteer in the organization with their role and assigned queues. Administrators can add or remove volunteers and reconfigure queue assignments. All counts and list data are live queries against the demo database.`)
};

const es_demo_narrative_admin_people_queues_body = /** @type {(inputs: Demo_Narrative_Admin_People_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El directorio muestra cada voluntario de la organizacion con su rol y colas asignadas. Los administradores pueden agregar o eliminar voluntarios y reconfigurar las asignaciones de colas. Todos los conteos y datos de la lista son consultas en tiempo real contra la base de datos del demo.`)
};

/**
* | output |
* | --- |
* | "The roster shows every volunteer in the organization with their role and assigned queues. Administrators can add or remove volunteers and reconfigure queue a..." |
*
* @param {Demo_Narrative_Admin_People_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_queues_body = /** @type {((inputs?: Demo_Narrative_Admin_People_Queues_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_People_Queues_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_people_queues_body(inputs)
	return es_demo_narrative_admin_people_queues_body(inputs)
});