/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_BodyInputs */

const en_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Thread filters narrow the visible messages by message type, author, or date. The server returns the matching set and the browser decrypts them locally.
**Message types.** Client messages, volunteer replies, internal notes, status changes, or assignments can each be isolated.
**Author filter.** In tickets with multiple volunteers, messages from a specific person can be shown alone.`)
};

const es_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los filtros de conversación reducen los mensajes visibles por tipo de mensaje, autor o fecha. El servidor devuelve el conjunto coincidente y el navegador los descifra localmente.
**Tipos de mensaje.** Mensajes del cliente, respuestas de voluntarios, notas internas, cambios de estado o asignaciones pueden aislarse individualmente.
**Filtro por autor.** En tickets con varios voluntarios, los mensajes de una persona específica pueden mostrarse solos.`)
};

const en_xa2_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thrèàd fìltèrs nàrròw thè vìsìblè mèssàgès by mèssàgè typè, àùthòr, òr dàtè. Thè sèrvèr rètùrns thè màtchìng sèt ànd thè bròwsèr dècrypts thèm lòcàlly.
 ••••••••••••••••••••••••••••••••••••••••••••••**Mèssàgè typès. •••••** Clìènt mèssàgès, vòlùntèèr rèplìès, ìntèrnàl nòtès, stàtùs chàngès, òr àssìgnmènts càn èàch bè ìsòlàtèd.
 ••••••••••••••••••••••••••••••••**Àùthòr fìltèr. •••••** Ìn tìckèts wìth mùltìplè vòlùntèèrs, mèssàgès fròm à spècìfìc pèrsòn càn bè shòwn àlònè. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Thread filters narrow the visible messages by message type, author, or date. The server returns the matching set and the browser decrypts them locally. **Mes..." |
*
* @param {Demo_Narrative_Topic_Thread_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_filters_body = /** @type {((inputs?: Demo_Narrative_Topic_Thread_Filters_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Thread_Filters_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_thread_filters_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_thread_filters_body(inputs)
	return en_demo_narrative_topic_thread_filters_body(inputs)
});