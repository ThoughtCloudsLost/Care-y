/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Unread_Badges_BodyInputs */

const en_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each ticket in the list shows an unread count when it has messages the volunteer has not yet read. The count reflects new messages since the volunteer last viewed that ticket.
**How read state works.** Each volunteer has an encrypted read cursor per ticket that records how far they have read. A cursor row is created on first open, so the server can see which tickets a volunteer has visited, but the cursor value itself is opaque ciphertext the server cannot read.`)
};

const es_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada ticket en la lista muestra un conteo de no leídos cuando tiene mensajes que el voluntario aún no ha visto. El conteo refleja los nuevos mensajes desde la última vez que el voluntario vio ese ticket.
**Cómo funciona el estado de lectura.** Cada voluntario tiene un cursor de lectura cifrado por ticket que registra hasta dónde ha leído. Se crea una fila de cursor en la primera apertura, así que el servidor puede ver qué tickets ha visitado un voluntario, pero el valor del cursor en sí es texto cifrado opaco que el servidor no puede leer.`)
};

const en_xa2_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch tìckèt ìn thè lìst shòws àn ùnrèàd còùnt whèn ìt hàs mèssàgès thè vòlùntèèr hàs nòt yèt rèàd. Thè còùnt rèflècts nèw mèssàgès sìncè thè vòlùntèèr làst vìèwèd thàt tìckèt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw rèàd stàtè wòrks. •••••••** Èàch vòlùntèèr hàs àn èncryptèd rèàd cùrsòr pèr tìckèt thàt rècòrds hòw fàr thèy hàvè rèàd. À cùrsòr ròw ìs crèàtèd òn fìrst òpèn, sò thè sèrvèr càn sèè whìch tìckèts à vòlùntèèr hàs vìsìtèd, bùt thè cùrsòr vàlùè ìtsèlf ìs òpàqùè cìphèrtèxt thè sèrvèr cànnòt rèàd. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each ticket in the list shows an unread count when it has messages the volunteer has not yet read. The count reflects new messages since the volunteer last v..." |
*
* @param {Demo_Narrative_Topic_Unread_Badges_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_unread_badges_body = /** @type {((inputs?: Demo_Narrative_Topic_Unread_Badges_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Unread_Badges_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_unread_badges_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_unread_badges_body(inputs)
	return en_demo_narrative_topic_unread_badges_body(inputs)
});