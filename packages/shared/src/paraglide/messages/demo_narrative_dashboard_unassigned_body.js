/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Unassigned_BodyInputs */

const en_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This section lists open tickets with no assignee from the queues the signed-in user belongs to. Tickets on hold are excluded. Taking a ticket sets the signed-in account as the assignee and moves the ticket to [My tickets](#dashboard/my-tickets). [[#client-data #permissions]]
**Why the count can differ from the rows.** The number beside the heading is a server count over every queue the account can access. The rows come from the overview page's single load, capped at five in list or card view and six in grid view. The difference can make the count higher than the visible rows. [[#metadata]]
**What an assignment records.** The assignee is a plaintext column on the ticket row, alongside the queue, the status, the priority, and the creation time. A database dump shows which account holds which ticket, how long the ticket sat unassigned, and at what priority. It shows nothing about who the ticket concerns or what it says. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns across the schema. [[#server-holds #metadata]]
**The counts query.** \`counts\` in \`packages/server/src/tickets/ticket-service.ts\` sums one case expression per bucket in a single pass, scoped to the queue IDs from \`getAccessibleQueueIds\`. Its unassigned arm tests for an open status and a null assignee. An account in no queue gets zeros rather than an error. [The permission system](#deep-dive/the-permission-system) covers how queue membership grants access. [[#permissions]]`)
};

const es_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta sección enumera los tickets abiertos sin persona asignada de las colas a las que pertenece la persona que inició sesión. Los tickets en espera quedan excluidos. Tomar un ticket establece la cuenta activa como asignada y lo traslada a [Mis tickets](#dashboard/my-tickets). [[#client-data #permissions]]
**Por qué el recuento puede diferir de las filas.** El número junto al encabezado es un recuento del servidor sobre todas las colas a las que la cuenta tiene acceso. Las filas provienen de la carga única de la página de resumen, limitadas a cinco en vista de lista o tarjetas y seis en vista de cuadrícula. La diferencia puede hacer que el recuento supere las filas visibles. [[#metadata]]
**Lo que registra una asignación.** La persona asignada es una columna en texto plano de la fila del ticket, junto a la cola, el estado, la prioridad y la fecha de creación. Un volcado de la base de datos muestra qué cuenta tiene qué ticket, cuánto tiempo estuvo sin asignar y con qué prioridad. No muestra nada sobre a quién se refiere el ticket ni qué dice. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano de todo el esquema. [[#server-holds #metadata]]
**La consulta de recuentos.** \`counts\`, en \`packages/server/src/tickets/ticket-service.ts\`, suma una expresión condicional por grupo en una sola pasada, limitada a los identificadores de cola de \`getAccessibleQueueIds\`. Su rama de sin asignar comprueba que el estado sea abierto y que no haya persona asignada. Una cuenta sin ninguna cola recibe ceros en lugar de un error. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo la pertenencia a una cola concede el acceso. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sèctìòn lìsts òpèn tìckèts wìth nò àssìgnèè fròm thè qùèùès thè sìgnèd-ìn ùsèr bèlòngs tò. Tìckèts òn hòld àrè èxclùdèd. Tàkìng à tìckèt sèts thè sìgnèd-ìn àccòùnt às thè àssìgnèè ànd mòvès thè tìckèt tò [My tìckèts](#dàshbòàrd/my-tìckèts). [[#clìènt-dàtà #pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why thè còùnt càn dìffèr fròm thè ròws. ••••••••••••** Thè nùmbèr bèsìdè thè hèàdìng ìs à sèrvèr còùnt òvèr èvèry qùèùè thè àccòùnt càn àccèss. Thè ròws còmè fròm thè òvèrvìèw pàgè's sìnglè lòàd, càppèd àt fìvè ìn lìst òr càrd vìèw ànd sìx ìn grìd vìèw. Thè dìffèrèncè càn màkè thè còùnt hìghèr thàn thè vìsìblè ròws. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt àn àssìgnmènt rècòrds. •••••••••** Thè àssìgnèè ìs à plàìntèxt còlùmn òn thè tìckèt ròw, àlòngsìdè thè qùèùè, thè stàtùs, thè prìòrìty, ànd thè crèàtìòn tìmè. À dàtàbàsè dùmp shòws whìch àccòùnt hòlds whìch tìckèt, hòw lòng thè tìckèt sàt ùnàssìgnèd, ànd àt whàt prìòrìty. Ìt shòws nòthìng àbòùt whò thè tìckèt còncèrns òr whàt ìt sàys. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thè plàìntèxt còlùmns àcròss thè schèmà. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè còùnts qùèry. ••••••** \`còùnts\` ìn \`pàckàgès/sèrvèr/src/tìckèts/tìckèt-sèrvìcè.ts\` sùms ònè càsè èxprèssìòn pèr bùckèt ìn à sìnglè pàss, scòpèd tò thè qùèùè ÌDs fròm \`gètÀccèssìblèQùèùèÌds\`. Ìts ùnàssìgnèd àrm tèsts fòr àn òpèn stàtùs ànd à nùll àssìgnèè. Àn àccòùnt ìn nò qùèùè gèts zèròs ràthèr thàn àn èrròr. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw qùèùè mèmbèrshìp grànts àccèss. [[#pèrmìssìòns]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This section lists open tickets with no assignee from the queues the signed-in user belongs to. Tickets on hold are excluded. Taking a ticket sets the signed..." |
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