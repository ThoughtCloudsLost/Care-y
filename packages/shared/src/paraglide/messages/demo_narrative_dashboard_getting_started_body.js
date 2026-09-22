/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Getting_Started_BodyInputs */

const en_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A setup checklist gathers eight tasks, each one opening the admin page that finishes it. An account has access to the checklist with permission to manage the organization's identity. [[#permissions]]
**What each item checks.** Whether more than one account is active, whether a logo and a retention period are set, whether a queue exists beyond the first one, and whether at least one greeting, text reply, preset reply and knowledge base article has been written. Completion is a count of rows and a test for a value, so the check never reads a greeting, an article or a queue name. [[#server-holds]]
**What the counts already tell the server.** Those totals are facts the server holds either way: how many accounts are active, how many queues and articles exist, whether a logo and a retention period are set. A database dump carries the same totals without any of the names or the content behind them. [Retention policy](#admin-org/retention) covers what the retention setting itself does. [[#metadata #server-holds]]
**What dismissing it does.** One timestamp on the organization's config row, so the checklist is dismissed for every account that could see it at once, and no route clears it again. Nothing about an individual account is recorded by the dismissal. [[#failure-states #server-holds]]
**The checklist service and its column.** \`createDashboardService\` in \`packages/server/src/dashboard/dashboard-service.ts\` runs the counts behind a route gated on the organization identity permission, the item ids and their wording are \`packages/client/src/lib/onboarding/checklist-items.ts\`, and the column is \`getting_started_dismissed_at\` from \`071_add_getting_started_dismissed.ts\`. [[#permissions]]`)
};

const es_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una lista de primeros pasos reúne ocho tareas de configuración, cada una de las cuales abre la página de administración que la completa. Una cuenta tiene acceso a la lista con permiso para gestionar la identidad de la organización. [[#permissions]]
**Qué comprueba cada elemento.** Si hay más de una cuenta activa, si están puestos un logotipo y un periodo de retención, si existe alguna cola además de la primera, y si se ha escrito al menos un saludo, una respuesta de texto, una respuesta predefinida y un artículo de la base de conocimiento. Completar es un recuento de filas y una comprobación de que haya un valor, así que la comprobación nunca lee un saludo, un artículo ni el nombre de una cola. [[#server-holds]]
**Lo que esos recuentos ya le dicen al servidor.** Esos totales son datos que el servidor tiene de todos modos: cuántas cuentas están activas, cuántas colas y artículos existen y si hay un logotipo y un periodo de retención. Un volcado de la base de datos lleva esos mismos totales sin ninguno de los nombres ni del contenido que hay detrás. [Política de retención](#admin-org/retention) trata qué hace el propio ajuste de retención. [[#metadata #server-holds]]
**Qué hace descartarla.** Una sola marca de tiempo en la fila de configuración de la organización, de modo que la lista queda descartada de una vez para todas las cuentas que podían verla, y ninguna ruta la vuelve a vaciar. El descarte no registra nada sobre ninguna cuenta concreta. [[#failure-states #server-holds]]
**El servicio de la lista y su columna.** \`createDashboardService\`, en \`packages/server/src/dashboard/dashboard-service.ts\`, ejecuta los recuentos detrás de una ruta protegida por el permiso de identidad de la organización, los identificadores de los elementos y su redacción están en \`packages/client/src/lib/onboarding/checklist-items.ts\`, y la columna es \`getting_started_dismissed_at\`, de \`071_add_getting_started_dismissed.ts\`. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À càrd àt thè tòp òf thè òvèrvìèw lìsts sètùp tàsks, èàch lìnkìng tò thè rèlèvànt àdmìn pàgè.
 •••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thè chècklìst ìs vìsìblè ònly tò àdmìnìstràtòrs. Vòlùntèèrs ànd mànàgèrs nèvèr sèè ìt.
 •••••••••••••••••••••••••••**Dìsmìssàl. •••** Òncè sètùp ìs còmplètè, thè chècklìst càn bè pèrmànèntly dìsmìssèd. Dìsmìssàl ìs rècòrdèd àt thè òrgànìzàtìòn lèvèl, sò ìt àpplìès tò àll àdmìnìstràtòrs àt òncè. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A setup checklist gathers eight tasks, each one opening the admin page that finishes it. An account has access to the checklist with permission to manage the..." |
*
* @param {Demo_Narrative_Dashboard_Getting_Started_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_getting_started_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Getting_Started_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Getting_Started_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_getting_started_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_getting_started_body(inputs)
	return en_demo_narrative_dashboard_getting_started_body(inputs)
});