/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Timeline_BodyInputs */

const en_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The detail subnavbar includes a chat/timeline toggle. Timeline view replaces the message thread with a structured table of contents. It shows status changes, assignments, notes, and messages as a chronological overview. All entries are decrypted locally. The server stores them as opaque ciphertext.`)
};

const es_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sub-barra de navegacion del detalle incluye un selector chat/linea de tiempo. La vista de linea de tiempo reemplaza el hilo de mensajes con un indice estructurado. Muestra cambios de estado, asignaciones, notas y mensajes como un panorama cronologico. Todas las entradas se descifran localmente. El servidor las almacena como texto cifrado opaco.`)
};

/**
* | output |
* | --- |
* | "The detail subnavbar includes a chat/timeline toggle. Timeline view replaces the message thread with a structured table of contents. It shows status changes,..." |
*
* @param {Demo_Narrative_Topic_Timeline_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_timeline_body = /** @type {((inputs?: Demo_Narrative_Topic_Timeline_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Timeline_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_timeline_body(inputs)
	return es_demo_narrative_topic_timeline_body(inputs)
});