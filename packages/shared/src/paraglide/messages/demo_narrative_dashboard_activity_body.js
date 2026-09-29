/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Activity_BodyInputs */

const en_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The activity feed shows events from the audit log for tickets in the queues the user belongs to, and organization events for which the user holds the performing permission, newest first. A user with View audit log also sees ticket events from queues they are not in; those rows show no client alias and cannot be opened. The feed shows the five most recent events. The heading counts visible events in the past hour under the current filters. [[#permissions #metadata]]
**Activity fields and encryption.** Each activity records its type, an internal ID for the user who acted, an internal ID for the ticket acted on, a metadata object, and a timestamp, all as plaintext on the server. Neither ID is a name or case content. An activity records that a ticket was closed, not what the ticket contained. Volunteer names are encrypted separately. The service writes no phone numbers or message content. The server can see the pattern of which user acted on which ticket and when. The client alias and queue name displayed beside each activity are end-to-end encrypted with the organization key. The query joins them in from their source tables. The browser decrypts them. [[#server-holds #encryption]]
**Activity types.** The feed shows twelve kinds of ticket event and the permitted organization events. Every event kind the feed can show has a label. The ticket event kinds are:
- Creation, closing, and reopening.
- Assignment to a volunteer.
- A new message in a ticket's conversation.
- Content edits to a ticket.
- Reply token revocation.
- Client communication tier changes.
- Portal channel regeneration and revocation.
- Client account resets.
- Routing a quarantined voicemail to a ticket.
Organization events cover queue, role, escalation rule, intake form, note type, merge, client data, and voicemail quarantine changes, each gated by the permission that performs them. [[#failure-states]]
**Filters and refresh.** The feed can be filtered by kind (ticket events or organization events) and by queue. Choosing a queue leaves organization events out. The feed refreshes every minute while the tab is visible. [[#metadata]]
**Query path and access control.** \`listRecentActivity\` and \`countRecentActivity\` in \`packages/server/src/tickets/audit.ts\` query the audit log. They apply no access control of their own. The route builds the scope from the user's permissions, queue membership, and filters. The audit log is append-only with no update or delete path. [Audit log](#admin-logs/audit) covers the full log and who can access it. [[#permissions]]`)
};

const es_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El feed de actividad muestra eventos del registro de auditoría para tickets en las colas a las que pertenece la persona usuaria, y eventos de organización para los cuales la persona usuaria tiene el permiso correspondiente, del más reciente al más antiguo. Una persona usuaria con Ver registro de auditoría también ve eventos de tickets de colas a las que no pertenece; esas filas no muestran alias de cliente y no se pueden abrir. El feed muestra los cinco eventos más recientes. El encabezado cuenta los eventos visibles en la última hora según los filtros activos. [[#permissions #metadata]]
**Campos de actividad y cifrado.** Cada actividad registra su tipo, un ID interno de la persona que actuó, un ID interno del ticket sobre el que se actuó, un objeto de metadatos y una marca de tiempo, todo como texto plano en el servidor. Ninguno de los dos IDs es un nombre ni contenido del caso. Una actividad registra que un ticket fue cerrado, no lo que el ticket contenía. Los nombres de los voluntarios se cifran por separado. El servicio no registra números de teléfono ni contenido de mensajes. El servidor puede ver el patrón de qué persona actuó sobre qué ticket y cuándo. El alias del cliente y el nombre de la cola que se muestran junto a cada actividad están cifrados de extremo a extremo con la clave de la organización. La consulta los une desde sus tablas de origen. El navegador los descifra. [[#server-holds #encryption]]
**Tipos de actividad.** El feed muestra doce tipos de eventos de tickets y los eventos de organización permitidos. Cada tipo de evento que el feed puede mostrar tiene una etiqueta. Los tipos de eventos de tickets son:
- Creación, cierre y reapertura.
- Asignación a un voluntario.
- Un mensaje nuevo en la conversación de un ticket.
- Ediciones de contenido de un ticket.
- Revocación de token de respuesta.
- Cambios del nivel de comunicación del cliente.
- Regeneración y revocación de canal del portal.
- Restablecimiento de cuenta de cliente.
- Enrutamiento de un correo de voz en cuarentena a un ticket.
Los eventos de organización cubren cambios de colas, roles, reglas de escalamiento, formularios de ingreso, tipos de nota, fusiones, datos de cliente y cuarentena de correo de voz, cada uno restringido por el permiso que los ejecuta. [[#failure-states]]
**Filtros y actualización.** El feed se puede filtrar por tipo (eventos de tickets o eventos de organización) y por cola. Elegir una cola excluye los eventos de organización. El feed se actualiza cada minuto mientras la pestaña está visible. [[#metadata]]
**Ruta de consulta y control de acceso.** \`listRecentActivity\` y \`countRecentActivity\` en \`packages/server/src/tickets/audit.ts\` consultan el registro de auditoría. No aplican control de acceso propio. La ruta construye el alcance a partir de los permisos, la membresía de colas y los filtros de la persona usuaria. El registro de auditoría es de solo adición, sin ruta de actualización ni eliminación. [Registro de auditoría](#admin-logs/audit) cubre el registro completo y quién puede acceder a él. [[#permissions]]`)
};

const en_xa2_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àctìvìty fèèd shòws èvènts fròm thè àùdìt lòg fòr tìckèts ìn thè qùèùès thè ùsèr bèlòngs tò, ànd òrgànìzàtìòn èvènts fòr whìch thè ùsèr hòlds thè pèrfòrmìng pèrmìssìòn, nèwèst fìrst. À ùsèr wìth Vìèw àùdìt lòg àlsò sèès tìckèt èvènts fròm qùèùès thèy àrè nòt ìn; thòsè ròws shòw nò clìènt àlìàs ànd cànnòt bè òpènèd. Thè fèèd shòws thè fìvè mòst rècènt èvènts. Thè hèàdìng còùnts vìsìblè èvènts ìn thè pàst hòùr ùndèr thè cùrrènt fìltèrs. [[#pèrmìssìòns #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àctìvìty fìèlds ànd èncryptìòn. ••••••••••** Èàch àctìvìty rècòrds ìts typè, àn ìntèrnàl ÌD fòr thè ùsèr whò àctèd, àn ìntèrnàl ÌD fòr thè tìckèt àctèd òn, à mètàdàtà òbjèct, ànd à tìmèstàmp, àll às plàìntèxt òn thè sèrvèr. Nèìthèr ÌD ìs à nàmè òr càsè còntènt. Àn àctìvìty rècòrds thàt à tìckèt wàs clòsèd, nòt whàt thè tìckèt còntàìnèd. Vòlùntèèr nàmès àrè èncryptèd sèpàràtèly. Thè sèrvìcè wrìtès nò phònè nùmbèrs òr mèssàgè còntènt. Thè sèrvèr càn sèè thè pàttèrn òf whìch ùsèr àctèd òn whìch tìckèt ànd whèn. Thè clìènt àlìàs ànd qùèùè nàmè dìsplàyèd bèsìdè èàch àctìvìty àrè ènd-tò-ènd èncryptèd wìth thè òrgànìzàtìòn kèy. Thè qùèry jòìns thèm ìn fròm thèìr sòùrcè tàblès. Thè bròwsèr dècrypts thèm. [[#sèrvèr-hòlds #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Àctìvìty typès. •••••** Thè fèèd shòws twèlvè kìnds òf tìckèt èvènt ànd thè pèrmìttèd òrgànìzàtìòn èvènts. Èvèry èvènt kìnd thè fèèd càn shòw hàs à làbèl. Thè tìckèt èvènt kìnds àrè:
- Crèàtìòn, clòsìng, ànd rèòpènìng.
- Àssìgnmènt tò à vòlùntèèr.
- À nèw mèssàgè ìn à tìckèt's cònvèrsàtìòn.
- Còntènt èdìts tò à tìckèt.
- Rèply tòkèn rèvòcàtìòn.
- Clìènt còmmùnìcàtìòn tìèr chàngès.
- Pòrtàl chànnèl règènèràtìòn ànd rèvòcàtìòn.
- Clìènt àccòùnt rèsèts.
- Ròùtìng à qùàràntìnèd vòìcèmàìl tò à tìckèt.
Òrgànìzàtìòn èvènts còvèr qùèùè, ròlè, èscàlàtìòn rùlè, ìntàkè fòrm, nòtè typè, mèrgè, clìènt dàtà, ànd vòìcèmàìl qùàràntìnè chàngès, èàch gàtèd by thè pèrmìssìòn thàt pèrfòrms thèm. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìltèrs ànd rèfrèsh. ••••••** Thè fèèd càn bè fìltèrèd by kìnd (tìckèt èvènts òr òrgànìzàtìòn èvènts) ànd by qùèùè. Chòòsìng à qùèùè lèàvès òrgànìzàtìòn èvènts òùt. Thè fèèd rèfrèshès èvèry mìnùtè whìlè thè tàb ìs vìsìblè. [[#mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèry pàth ànd àccèss còntròl. •••••••••** \`lìstRècèntÀctìvìty\` ànd \`còùntRècèntÀctìvìty\` ìn \`pàckàgès/sèrvèr/src/tìckèts/àùdìt.ts\` qùèry thè àùdìt lòg. Thèy àpply nò àccèss còntròl òf thèìr òwn. Thè ròùtè bùìlds thè scòpè fròm thè ùsèr's pèrmìssìòns, qùèùè mèmbèrshìp, ànd fìltèrs. Thè àùdìt lòg ìs àppènd-ònly wìth nò ùpdàtè òr dèlètè pàth. [Àùdìt lòg](#àdmìn-lògs/àùdìt) còvèrs thè fùll lòg ànd whò càn àccèss ìt. [[#pèrmìssìòns]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The activity feed shows events from the audit log for tickets in the queues the user belongs to, and organization events for which the user holds the perform..." |
*
* @param {Demo_Narrative_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_activity_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Activity_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Activity_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_activity_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_activity_body(inputs)
	return en_demo_narrative_dashboard_activity_body(inputs)
});