/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Unassigned_BodyInputs */

const en_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This section lists open tickets with no assignee from the queues the signed-in user belongs to. Tickets on hold are excluded. The lane has a filter button that uses the tickets page filters. It starts collapsed in the stacked layout. [View switcher](#dashboard/view-switcher) covers how many tickets a lane shows. Taking a ticket sets the signed-in account as the assignee and moves the ticket to [My tickets](#dashboard/my-tickets). [[#client-data #permissions]]
**What does an assignment record?** The assignee is a plaintext column on the ticket row, alongside the queue, the status, the priority, and the creation time. A database dump shows which account holds which ticket, how long the ticket sat unassigned, and at what priority. It shows nothing about who the ticket concerns or what it says. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns across the schema. [[#server-holds #metadata]]
**The lane query and heading count.** Each lane fetches its own page of tickets and counts matches from a shared metadata index that covers every ticket the user has access to. The unassigned lane tests for an open status, no hold, and a null assignee. A user in no queue sees an empty lane. [The permission system](#deep-dive/the-permission-system) covers how queue membership grants access. [[#permissions]]`)
};

const es_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta sección enumera los tickets abiertos sin persona asignada de las colas a las que pertenece la persona que inició sesión. Los tickets en espera quedan excluidos. El carril tiene un botón de filtro que usa los filtros de la página de tickets. Empieza contraído en la disposición apilada. [Selector de vista](#dashboard/view-switcher) explica cuántos tickets muestra un carril. Tomar un ticket establece la cuenta activa como asignada y lo traslada a [Mis tickets](#dashboard/my-tickets). [[#client-data #permissions]]
**¿Qué registra una asignación?** La persona asignada es una columna en texto plano de la fila del ticket, junto a la cola, el estado, la prioridad y la fecha de creación. Un volcado de la base de datos muestra qué cuenta tiene qué ticket, cuánto tiempo estuvo sin asignar y con qué prioridad. No muestra nada sobre a quién se refiere el ticket ni qué dice. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano de todo el esquema. [[#server-holds #metadata]]
**La consulta del carril y el recuento del encabezado.** Cada carril solicita su propia página de tickets y cuenta las coincidencias a partir de un índice compartido de metadatos que abarca todos los tickets a los que la persona usuaria tiene acceso. El carril de sin asignar comprueba que el estado sea abierto, que no haya espera y que no haya persona asignada. La persona usuaria que no pertenece a ninguna cola ve el carril vacío. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo la pertenencia a una cola concede el acceso. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_unassigned_body = /** @type {(inputs: Demo_Narrative_Dashboard_Unassigned_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs sèctìòn lìsts òpèn tìckèts wìth nò àssìgnèè fròm thè qùèùès thè sìgnèd-ìn ùsèr bèlòngs tò. Tìckèts òn hòld àrè èxclùdèd. Thè lànè hàs à fìltèr bùttòn thàt ùsès thè tìckèts pàgè fìltèrs. Ìt stàrts còllàpsèd ìn thè stàckèd làyòùt. [Vìèw swìtchèr](#dàshbòàrd/vìèw-swìtchèr) còvèrs hòw màny tìckèts à lànè shòws. Tàkìng à tìckèt sèts thè sìgnèd-ìn àccòùnt às thè àssìgnèè ànd mòvès thè tìckèt tò [My tìckèts](#dàshbòàrd/my-tìckèts). [[#clìènt-dàtà #pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès àn àssìgnmènt rècòrd? ••••••••••** Thè àssìgnèè ìs à plàìntèxt còlùmn òn thè tìckèt ròw, àlòngsìdè thè qùèùè, thè stàtùs, thè prìòrìty, ànd thè crèàtìòn tìmè. À dàtàbàsè dùmp shòws whìch àccòùnt hòlds whìch tìckèt, hòw lòng thè tìckèt sàt ùnàssìgnèd, ànd àt whàt prìòrìty. Ìt shòws nòthìng àbòùt whò thè tìckèt còncèrns òr whàt ìt sàys. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thè plàìntèxt còlùmns àcròss thè schèmà. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè lànè qùèry ànd hèàdìng còùnt. ••••••••••** Èàch lànè fètchès ìts òwn pàgè òf tìckèts ànd còùnts màtchès fròm à shàrèd mètàdàtà ìndèx thàt còvèrs èvèry tìckèt thè ùsèr hàs àccèss tò. Thè ùnàssìgnèd lànè tèsts fòr àn òpèn stàtùs, nò hòld, ànd à nùll àssìgnèè. À ùsèr ìn nò qùèùè sèès àn èmpty lànè. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw qùèùè mèmbèrshìp grànts àccèss. [[#pèrmìssìòns]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This section lists open tickets with no assignee from the queues the signed-in user belongs to. Tickets on hold are excluded. The lane has a filter button th..." |
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