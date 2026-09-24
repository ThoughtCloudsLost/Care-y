/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Notes_BodyInputs */

const en_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An internal note records what the organization wants remembered about a case without sending anything to the client, and it is sealed with the same case key as the messages around it. [[#client-data #encryption]]
**What the server holds around a note.** The note's own content is ciphertext. Its type, its author, its creation time, the accounts mentioned in it and the private flag are plaintext columns, so a database dump shows that a manager wrote a safety-concern note on a case at a given hour and named two accounts in it, and none of what it says. [The trust boundary](#deep-dive/the-trust-boundary) lists those columns beside the rest of the schema. [[#server-holds #metadata]]
**Note types and who sees them.** Each note carries a type, and a type carries a minimum role for writing one and a minimum role for seeing one. The server drops the notes a caller's role may not see before the response is built, so a restricted note never reaches a browser below the threshold, and an author always sees their own. A type's name, icon and description are organization-key ciphertext, and the roles it gates on are plaintext, so the server enforces the rule without reading what the type is called. [Note types](#admin-org/note-types) covers creating and editing them. [[#permissions #privacy #encryption]]
**Why a note can raise an alert.** A type can name who to notify when a note of that type is written, and those targets are sealed with the server's own operational key rather than the organization key, because the server is what sends the notification with nobody signed in. Mentioning an account in a note pings it once rather than subscribing it to the case. [Data retention](#deep-dive/data-retention) covers what the notification itself carries. [[#trust-boundary #server-holds]]
**Reactions, edits and deletions.** Five reactions are available on a note, each one a plaintext row naming the account, the note and the time. An account may edit its own notes, an account may delete its own, and an administrator may delete another account's without being able to edit it. A deleted note is marked deleted and excluded from every read; its ciphertext stays in the row. [[#permissions #retention #metadata]]
**The note path and its tables.** The compose surface is \`InternalNoteSheet.svelte\`, the role filter is in \`listFollowUps\` in \`packages/server/src/tickets/followup-service.ts\`, and the types come from \`058_create_note_types.ts\` with the role columns from \`062_add_note_type_role_gating.ts\`. Reactions are \`063_create_followup_reactions.ts\`, and mention validation is \`packages/server/src/tickets/mentions.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una nota interna registra lo que la organización quiere recordar de un caso sin enviarle nada al cliente, y se sella con la misma clave del caso que los mensajes que la rodean. [[#client-data #encryption]]
**Lo que el servidor guarda alrededor de una nota.** El contenido de la nota es texto cifrado. Su tipo, su autoría, su fecha de creación, las cuentas mencionadas en ella y la marca de privada son columnas en texto plano, de modo que un volcado de la base de datos muestra que una persona gestora escribió una nota de preocupación por seguridad en un caso a cierta hora y nombró en ella a dos cuentas, y nada de lo que dice. [La frontera de confianza](#deep-dive/the-trust-boundary) enumera esas columnas junto al resto del esquema. [[#server-holds #metadata]]
**Los tipos de nota y quién los ve.** Cada nota lleva un tipo, y un tipo lleva un rol mínimo para escribirla y un rol mínimo para verla. El servidor descarta las notas que el rol de quien consulta no puede ver antes de armar la respuesta, así que una nota restringida nunca llega a un navegador por debajo del umbral, y quien la escribió siempre ve las suyas. El nombre, el icono y la descripción de un tipo son texto cifrado con la clave de la organización, y los roles con los que restringe están en texto plano, de modo que el servidor aplica la regla sin leer cómo se llama el tipo. [Tipos de nota](#admin-org/note-types) trata cómo se crean y se editan. [[#permissions #privacy #encryption]]
**Por qué una nota puede levantar un aviso.** Un tipo puede nombrar a quién avisar cuando se escribe una nota de ese tipo, y esos destinos se sellan con la clave operativa del propio servidor y no con la de la organización, porque el servidor es quien envía el aviso sin nadie con la sesión iniciada. Mencionar a una cuenta en una nota la avisa una vez, no la suscribe al caso. [Retención de datos](#deep-dive/data-retention) trata lo que lleva el aviso en sí. [[#trust-boundary #server-holds]]
**Reacciones, ediciones y borrados.** Hay cinco reacciones disponibles sobre una nota, cada una una fila en texto plano que nombra la cuenta, la nota y la fecha. Una cuenta puede editar sus propias notas, una cuenta puede borrar las suyas, y una persona administradora puede borrar la de otra cuenta sin poder editarla. Una nota borrada queda marcada como borrada y se excluye de todas las lecturas; su texto cifrado permanece en la fila. [[#permissions #retention #metadata]]
**El camino de la nota y sus tablas.** La superficie de redacción es \`InternalNoteSheet.svelte\`, el filtro por rol está en \`listFollowUps\`, en \`packages/server/src/tickets/followup-service.ts\`, y los tipos vienen de \`058_create_note_types.ts\` con las columnas de rol de \`062_add_note_type_role_gating.ts\`. Las reacciones son \`063_create_followup_reactions.ts\`, y la validación de menciones es \`packages/server/src/tickets/mentions.ts\`. [[#client-data]]`)
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
* | "An internal note records what the organization wants remembered about a case without sending anything to the client, and it is sealed with the same case key ..." |
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