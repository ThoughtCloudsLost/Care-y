/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Notes_BodyInputs */

const en_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notes are visible only to org members and are encrypted with the same per ticket key as messages. The server holds the note type and role gating metadata that determine which notes each volunteer can see, but it cannot read the note content itself.
**Note types.** Each note is tagged with a type. The four defaults are Comment for general observations, Resolution for documenting how the ticket was resolved and prompted on close, Safety Concern for flagging risk to someone's wellbeing with notifications to admins and managers, and Request for asking for additional resources with notifications to admins and managers. Administrators can edit these and create additional types from the admin settings page.
**Visibility.** Note types have a minimum view role setting. A note type restricted to managers or above is invisible to regular volunteers. The server filters notes by role before returning them, so restricted notes never reach the browser of a volunteer below the threshold. The note author can always see their own notes regardless of role.
**Reactions.** Volunteers can add reactions to notes. Five reaction types are available: acknowledge, approve, disagree, flag, and complete. Reactions are plaintext metadata visible to all volunteers who can see the note, and they are not currently available on client messages.`)
};

const es_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las notas solo son visibles para miembros de la organización y se cifran con la misma clave por ticket que los mensajes. El servidor conserva los metadatos de tipo de nota y restricción por rol que determinan qué notas puede ver cada voluntario, pero no puede leer el contenido de las notas en sí.
**Tipos de nota.** Cada nota se etiqueta con un tipo. Los cuatro predeterminados son Comentario para observaciones generales, Resolución para documentar cómo se resolvió el ticket y que se solicita al cerrar, Preocupación de Seguridad para señalar riesgo para el bienestar de alguien con notificación a administradores y gestores, y Solicitud para pedir recursos adicionales con notificación a administradores y gestores. Los administradores pueden editar estos y crear tipos adicionales desde la página de configuración de administración.
**Visibilidad.** Los tipos de nota tienen una configuración de rol mínimo de visualización. Un tipo de nota restringido a gestores o superiores es invisible para voluntarios regulares. El servidor filtra las notas por rol antes de devolverlas, por lo que las notas restringidas nunca llegan al navegador de un voluntario por debajo del umbral. El autor de la nota siempre puede ver sus propias notas independientemente del rol.
**Reacciones.** Los voluntarios pueden añadir reacciones a las notas. Cinco tipos de reacción están disponibles: reconocer, aprobar, discrepar, marcar y completar. Las reacciones son metadatos en texto plano visibles para todos los voluntarios que pueden ver la nota, y actualmente no están disponibles en mensajes del cliente.`)
};

const en_xa2_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtès àrè vìsìblè ònly tò òrg mèmbèrs ànd àrè èncryptèd wìth thè sàmè pèr tìckèt kèy às mèssàgès. Thè sèrvèr hòlds thè nòtè typè ànd ròlè gàtìng mètàdàtà thàt dètèrmìnè whìch nòtès èàch vòlùntèèr càn sèè, bùt ìt cànnòt rèàd thè nòtè còntènt ìtsèlf.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Nòtè typès. ••••** Èàch nòtè ìs tàggèd wìth à typè. Thè fòùr dèfàùlts àrè Còmmènt fòr gènèràl òbsèrvàtìòns, Rèsòlùtìòn fòr dòcùmèntìng hòw thè tìckèt wàs rèsòlvèd ànd pròmptèd òn clòsè, Sàfèty Còncèrn fòr flàggìng rìsk tò sòmèònè's wèllbèìng wìth nòtìfìcàtìòns tò àdmìns ànd mànàgèrs, ànd Rèqùèst fòr àskìng fòr àddìtìònàl rèsòùrcès wìth nòtìfìcàtìòns tò àdmìns ànd mànàgèrs. Àdmìnìstràtòrs càn èdìt thèsè ànd crèàtè àddìtìònàl typès fròm thè àdmìn sèttìngs pàgè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Nòtè typès hàvè à mìnìmùm vìèw ròlè sèttìng. À nòtè typè rèstrìctèd tò mànàgèrs òr àbòvè ìs ìnvìsìblè tò règùlàr vòlùntèèrs. Thè sèrvèr fìltèrs nòtès by ròlè bèfòrè rètùrnìng thèm, sò rèstrìctèd nòtès nèvèr rèàch thè bròwsèr òf à vòlùntèèr bèlòw thè thrèshòld. Thè nòtè àùthòr càn àlwàys sèè thèìr òwn nòtès règàrdlèss òf ròlè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèàctìòns. •••** Vòlùntèèrs càn àdd rèàctìòns tò nòtès. Fìvè rèàctìòn typès àrè àvàìlàblè: àcknòwlèdgè, àppròvè, dìsàgrèè, flàg, ànd còmplètè. Rèàctìòns àrè plàìntèxt mètàdàtà vìsìblè tò àll vòlùntèèrs whò càn sèè thè nòtè, ànd thèy àrè nòt cùrrèntly àvàìlàblè òn clìènt mèssàgès. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Notes are visible only to org members and are encrypted with the same per ticket key as messages. The server holds the note type and role gating metadata tha..." |
*
* @param {Demo_Narrative_Topic_Notes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_notes_body = /** @type {((inputs?: Demo_Narrative_Topic_Notes_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Notes_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_notes_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_notes_body(inputs)
	return en_demo_narrative_topic_notes_body(inputs)
});