/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Date_Separators_BodyInputs */

const en_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date separators mark where one day ends and the next begins, and long conversations load in pages that are fetched and decrypted as the volunteer scrolls up through older history. A volunteer returning to a busy ticket also lands on an unread line above the first message that arrived since their last visit, which clears once those messages have been seen.`)
};

const es_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los separadores de fecha marcan donde termina un día y empieza el siguiente, y las conversaciones largas se cargan por páginas que se obtienen y descifran a medida que el voluntario se desplaza por el historial. Al volver a un ticket con actividad, el voluntario también encuentra una línea de no leídos sobre el primer mensaje recibido desde su última visita, que desaparece una vez vistos esos mensajes.`)
};

/**
* | output |
* | --- |
* | "Date separators mark where one day ends and the next begins, and long conversations load in pages that are fetched and decrypted as the volunteer scrolls up ..." |
*
* @param {Demo_Narrative_Topic_Date_Separators_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_date_separators_body = /** @type {((inputs?: Demo_Narrative_Topic_Date_Separators_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Date_Separators_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_date_separators_body(inputs)
	return es_demo_narrative_topic_date_separators_body(inputs)
});