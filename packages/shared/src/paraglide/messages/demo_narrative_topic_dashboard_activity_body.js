/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Dashboard_Activity_BodyInputs */

const en_demo_narrative_topic_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Topic_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The activity feed shows recent case events. Names and details are encrypted in the database and only appear after the browser decrypts them with the organization key loaded at login. The server never sees plaintext event content.`)
};

const es_demo_narrative_topic_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Topic_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El feed de actividad muestra eventos recientes de casos. Los nombres y detalles estan cifrados en la base de datos y solo aparecen despues de que el navegador los descifra con la clave de la organizacion cargada al iniciar sesion. El servidor nunca ve el contenido de los eventos en texto plano.`)
};

/**
* | output |
* | --- |
* | "The activity feed shows recent case events. Names and details are encrypted in the database and only appear after the browser decrypts them with the organiza..." |
*
* @param {Demo_Narrative_Topic_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_dashboard_activity_body = /** @type {((inputs?: Demo_Narrative_Topic_Dashboard_Activity_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Dashboard_Activity_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_dashboard_activity_body(inputs)
	return es_demo_narrative_topic_dashboard_activity_body(inputs)
});