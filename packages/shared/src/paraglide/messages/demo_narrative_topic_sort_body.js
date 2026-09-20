/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Sort_BodyInputs */

const en_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort options reorder the ticket list by priority, date, last activity, queue, status, client, or message count.
**Server side fields.** Priority, date, last activity, queue, and message count are sorted on the server using plaintext metadata columns. The server returns rows in the requested order without accessing encrypted content.
**Client side fields.** Client is sorted in the browser because the alias is encrypted and only readable on the device, and status is sorted in the browser because the display status (new vs active) is derived locally from the message count. Title and assignee are also sortable by tapping the column headers in table view, where the browser sorts the decrypted values locally.
**New replies first.** A toggle in the sort options pins tickets with unread replies to the top of the list, regardless of the primary sort order. Read state is encrypted per volunteer, so the server cannot sort by it and this sort happens entirely in the browser.`)
};

const es_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las opciones de orden reorganizan la lista de tickets por prioridad, fecha, última actividad, cola, estado, cliente o cantidad de mensajes.
**Campos del servidor.** Prioridad, fecha, última actividad, cola y cantidad de mensajes se ordenan en el servidor usando columnas de metadatos en texto plano. El servidor devuelve las filas en el orden solicitado sin acceder al contenido cifrado.
**Campos del cliente.** El cliente se ordena en el navegador porque el alias está cifrado y solo es legible en el dispositivo, y el estado se ordena en el navegador porque el estado de visualización (nuevo o activo) se deriva localmente de la cantidad de mensajes. Título y asignado también se pueden ordenar tocando los encabezados de columna en la vista de tabla, donde el navegador ordena los valores descifrados localmente.
**Nuevas respuestas primero.** Un interruptor en las opciones de orden fija los tickets con respuestas no leídas en la parte superior de la lista, independientemente del orden principal. El estado de lectura está cifrado por voluntario, por lo que el servidor no puede ordenar por él y este ordenamiento ocurre completamente en el navegador.`)
};

const en_xa2_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòrt òptìòns rèòrdèr thè tìckèt lìst by prìòrìty, dàtè, làst àctìvìty, qùèùè, stàtùs, clìènt, òr mèssàgè còùnt.
 ••••••••••••••••••••••••••••••••••**Sèrvèr sìdè fìèlds. ••••••** Prìòrìty, dàtè, làst àctìvìty, qùèùè, ànd mèssàgè còùnt àrè sòrtèd òn thè sèrvèr ùsìng plàìntèxt mètàdàtà còlùmns. Thè sèrvèr rètùrns ròws ìn thè rèqùèstèd òrdèr wìthòùt àccèssìng èncryptèd còntènt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Clìènt sìdè fìèlds. ••••••** Clìènt ìs sòrtèd ìn thè bròwsèr bècàùsè thè àlìàs ìs èncryptèd ànd ònly rèàdàblè òn thè dèvìcè, ànd stàtùs ìs sòrtèd ìn thè bròwsèr bècàùsè thè dìsplày stàtùs (nèw vs àctìvè) ìs dèrìvèd lòcàlly fròm thè mèssàgè còùnt. Tìtlè ànd àssìgnèè àrè àlsò sòrtàblè by tàppìng thè còlùmn hèàdèrs ìn tàblè vìèw, whèrè thè bròwsèr sòrts thè dècryptèd vàlùès lòcàlly.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Nèw rèplìès fìrst. ••••••** À tògglè ìn thè sòrt òptìòns pìns tìckèts wìth ùnrèàd rèplìès tò thè tòp òf thè lìst, règàrdlèss òf thè prìmàry sòrt òrdèr. Rèàd stàtè ìs èncryptèd pèr vòlùntèèr, sò thè sèrvèr cànnòt sòrt by ìt ànd thìs sòrt hàppèns èntìrèly ìn thè bròwsèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Sort options reorder the ticket list by priority, date, last activity, queue, status, client, or message count. **Server side fields.** Priority, date, last ..." |
*
* @param {Demo_Narrative_Topic_Sort_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_sort_body = /** @type {((inputs?: Demo_Narrative_Topic_Sort_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Sort_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_sort_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_sort_body(inputs)
	return en_demo_narrative_topic_sort_body(inputs)
});