/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Queues_BodyInputs */

const en_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each active queue the user belongs to gets a card carrying a count of open tickets and a count of urgent ones. Membership decides which cards appear, so two accounts in one organization see different sets. [[#permissions #privacy]]
**What each count counts.** The open count includes tickets that are on hold. The urgent count takes open tickets that are not on hold and whose priority is urgent, so a high-priority ticket is absent from it. Both are subqueries run against the tickets table when the request arrives rather than stored totals, so they move as soon as a ticket is created, closed or reassigned anywhere in the organization. [[#metadata]]
**What a queue row holds.** The name, the color and the icon are organization-key ciphertext the browser opens. The sort order, the escalation threshold, the active flag and the creation time are plaintext. A database dump shows how many queues an organization runs, in what order, how old each one is, and how many open and urgent tickets sit in each, and none of their names. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#encryption #server-holds #metadata]]
**The queue query and its migrations.** \`listActive\` in \`packages/server/src/tickets/queue-service.ts\` builds the counts, and the route filters its result against the membership rows from \`034_create_queue_assignments.ts\`. The name became ciphertext in \`045_encrypt_queue_names.ts\`, which also dropped the plaintext column, and color and icon arrived as nullable bytea in \`078_add_queue_color_icon.ts\`, so a queue created before that migration carries neither and the browser draws a default. [Queue management](#admin-people/queues) covers creating and reordering them. [[#encryption]]`)
};

const es_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada cola activa a la que pertenece la persona usuaria recibe una tarjeta con un recuento de tickets abiertos y otro de urgentes. La pertenencia decide qué tarjetas aparecen, así que dos cuentas de una misma organización ven conjuntos distintos. [[#permissions #privacy]]
**Qué cuenta cada recuento.** El recuento de abiertos incluye los tickets en espera. El de urgentes toma los tickets abiertos que no están en espera y cuya prioridad es urgente, de modo que un ticket de prioridad alta no figura en él. Ambos son subconsultas que se ejecutan contra la tabla de tickets cuando llega la petición y no totales almacenados, así que se mueven en cuanto se crea, se cierra o se reasigna un ticket en cualquier parte de la organización. [[#metadata]]
**Lo que guarda una fila de cola.** El nombre, el color y el icono son texto cifrado con la clave de la organización que abre el navegador. El orden, el umbral de escalado, la marca de activa y la fecha de creación están en texto plano. Un volcado de la base de datos muestra cuántas colas tiene una organización, en qué orden, qué antigüedad tiene cada una y cuántos tickets abiertos y urgentes hay en cada una, y ninguno de sus nombres. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización. [[#encryption #server-holds #metadata]]
**La consulta de colas y sus migraciones.** \`listActive\`, en \`packages/server/src/tickets/queue-service.ts\`, construye los recuentos, y la ruta filtra su resultado con las filas de pertenencia de \`034_create_queue_assignments.ts\`. El nombre pasó a texto cifrado en \`045_encrypt_queue_names.ts\`, que además eliminó la columna en claro, y el color y el icono llegaron como bytea anulable en \`078_add_queue_color_icon.ts\`, de modo que una cola creada antes de esa migración no tiene ninguno de los dos y el navegador dibuja un valor por defecto. [Gestión de colas](#admin-people/queues) trata cómo crearlas y reordenarlas. [[#encryption]]`)
};

const en_xa2_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònè càrd pèr qùèùè dèfìnèd by thè òrgànìzàtìòn, shòwìng lìvè còùnts òf òpèn ànd ùrgènt tìckèts.
 •••••••••••••••••••••••••••••**Lìvè còùnts. ••••** Còùnts àrè rèàl-tìmè dàtàbàsè qùèrìès, nòt càchèd snàpshòts. Thèy ùpdàtè àùtòmàtìcàlly whèn tìckèts àrè crèàtèd, clòsèd, òr rèàssìgnèd ànywhèrè ìn thè systèm.
 ••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Qùèùè nàmès ànd àppèàràncè sèttìngs àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Thè sèrvèr stòrès ònly cìphèrtèxt. Thè bròwsèr dècrypts thèm àt dìsplày tìmè. •••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each active queue the user belongs to gets a card carrying a count of open tickets and a count of urgent ones. Membership decides which cards appear, so two ..." |
*
* @param {Demo_Narrative_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_queues_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Queues_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Queues_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_queues_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_queues_body(inputs)
	return en_demo_narrative_dashboard_queues_body(inputs)
});