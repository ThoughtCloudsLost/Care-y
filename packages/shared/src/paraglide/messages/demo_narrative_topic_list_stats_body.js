/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Stats_BodyInputs */

const en_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The row under the page title shows live counts for new, active, and on hold tickets, and a new replies count once the browser finishes checking read state.
**Caught up stamp.** When every ticket has been read, a dateline stamp appears above the list marking the moment the volunteer caught up. New tickets arriving after that point stack above it.
**Where the numbers come from.** The status counts are computed from plaintext metadata columns, so the server provides them without reading any ticket content. The new replies count comes from the per volunteer read tracking described in the unread badges section.`)
};

const es_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La fila debajo del título de la página muestra conteos en tiempo real de tickets nuevos, activos y en espera, y un conteo de nuevas respuestas una vez que el navegador termina de comprobar el estado de lectura.
**Sello de al día.** Cuando todos los tickets han sido leídos, un sello con fecha aparece encima de la lista marcando el momento en que el voluntario se puso al día. Los tickets nuevos que lleguen después se apilan por encima.
**De dónde vienen los números.** Los conteos de estado se calculan a partir de columnas de metadatos en texto plano, por lo que el servidor los proporciona sin leer ningún contenido de ticket. El conteo de nuevas respuestas proviene del seguimiento de lectura por voluntario descrito en la sección de insignias de no leídos.`)
};

/**
* | output |
* | --- |
* | "The row under the page title shows live counts for new, active, and on hold tickets, and a new replies count once the browser finishes checking read state. *..." |
*
* @param {Demo_Narrative_Topic_List_Stats_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_stats_body = /** @type {((inputs?: Demo_Narrative_Topic_List_Stats_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Stats_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_list_stats_body(inputs)
	return es_demo_narrative_topic_list_stats_body(inputs)
});