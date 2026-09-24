/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Unassigned_BodyInputs */

const en_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An open ticket in the user's queues with nobody assigned waits here. Taking one records the account against the ticket and moves it into [My tickets](#dashboard/my-tickets). [[#client-data #permissions]]
**Why the count can exceed the rows.** The number beside the heading is a server count over every queue the account has access to, while the rows come from the page the overview loaded and the section lists five of them. The two answer different questions: the count is how much work is waiting, the rows are what is at hand. [[#metadata]]
**What an assignment records.** The assignee is a plaintext column on the ticket row, alongside the queue, the status, the priority and the creation time. A database dump shows which account holds which ticket, how long a ticket sat unheld and at what priority, and nothing about who the ticket concerns or what it says. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns across the schema. [[#server-holds #metadata]]
**The counts query.** \`counts\` in \`packages/server/src/tickets/ticket-service.ts\` sums one case expression per bucket in a single pass, restricted to the queue ids from \`getAccessibleQueueIds\`, and its unassigned arm tests for an open status and a null assignee. An account in no queue gets zeros rather than an error. [The permission system](#deep-dive/the-permission-system) covers how queue membership grants access. [[#permissions]]`)
};

const es_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un ticket abierto de las colas de la persona usuaria sin nadie asignado espera aquí. Tomar uno registra la cuenta en el ticket y lo traslada a [Mis tickets](#dashboard/my-tickets). [[#client-data #permissions]]
**Por qué el recuento puede superar a las filas.** El número junto al encabezado es un recuento del servidor sobre todas las colas a las que la cuenta tiene acceso, mientras que las filas salen de la página que cargó el resumen y la sección enumera cinco. Los dos responden preguntas distintas: el recuento es cuánto trabajo espera, las filas son lo que se tiene a mano. [[#metadata]]
**Lo que registra una asignación.** La persona asignada es una columna en texto plano de la fila del ticket, junto a la cola, el estado, la prioridad y la fecha de creación. Un volcado de la base de datos muestra qué cuenta tiene qué ticket, cuánto tiempo estuvo un ticket sin asignar y con qué prioridad, y nada sobre a quién se refiere el ticket ni qué dice. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano de todo el esquema. [[#server-holds #metadata]]
**La consulta de recuentos.** \`counts\`, en \`packages/server/src/tickets/ticket-service.ts\`, suma una expresión condicional por grupo en una sola pasada, limitada a los identificadores de cola de \`getAccessibleQueueIds\`, y su rama de sin asignar comprueba que el estado sea abierto y que no haya persona asignada. Una cuenta sin ninguna cola recibe ceros en lugar de un error. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo la pertenencia a una cola concede el acceso. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn tìckèts nòt yèt àssìgnèd tò ànyònè. Òncè àssìgnèd, à tìckèt mòvès tò thè àssìgnèè's wòrkìng lìst.
 •••••••••••••••••••••••••••••••**Ìf còùnts dìffèr. ••••••** Thè còùnt ìn thè sèctìòn hèàdìng rèflècts thè fùll tòtàl, whìlè thè vìsìblè ròws mày bè fèwèr bècàùsè thè òvèrvìèw fètchès à lìmìtèd pàgè òf rèsùlts. •••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An open ticket in the user's queues with nobody assigned waits here. Taking one records the account against the ticket and moves it into [My tickets](#dashbo..." |
*
* @param {Demo_Narrative_Dashboard_Unassigned_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_unassigned_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Unassigned_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Unassigned_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_unassigned_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_unassigned_body(inputs)
	return en_demo_narrative_dashboard_unassigned_body(inputs)
});