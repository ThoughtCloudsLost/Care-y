/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Audit_Log_BodyInputs */

const en_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The audit log records administrative and lifecycle actions taken in the organization. Entries are only ever added. The service has no update path and no delete path, so nothing written can be altered afterward. Viewing the log requires the View audit log permission. [The permission system](#deep-dive/the-permission-system) covers how permissions are granted. [[#permissions #server-holds]]
**What does a row hold?** Each row stores the event type, the acting account's ID, the affected ticket (when applicable), a JSON metadata payload, and a creation timestamp. All five fields are plaintext. None of them carry names, phone numbers, or message content. The actor's display name beside each row is organization-key ciphertext that the browser decrypts at read time. Actions the system performs on its own are logged under a fixed nil-UUID actor rather than any person's account. [Activity feed](#dashboard/activity) covers how the dashboard presents these rows. [[#privacy #encryption]]
**What does the full log reveal?** The rows, taken together, are an operational timeline. They show which accounts acted and when, how frequently tickets were opened or closed, when role permissions were modified, and when encryption keys were rotated. No row names a client or carries message content. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns elsewhere in the schema. [[#metadata #server-holds]]
**The query service and its filters.** \`query\` in \`packages/server/src/tickets/audit.ts\` returns rows newest first, fifty per page by default. The caller can narrow by event type, actor, ticket, or date range, and the count query applies the same narrowing. A failed audit insert does not block the operation that produced the event, but the failure is surfaced so a gap in the log is visible. [[#failure-states]]`)
};

const es_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El registro de auditoría conserva las acciones administrativas y de ciclo de vida tomadas en la organización. Las entradas solo se agregan. El servicio no tiene ruta de actualización ni de eliminación, por lo que nada escrito puede alterarse después. Consultar el registro requiere el permiso Ver registro de auditoría. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo se otorgan los permisos. [[#permissions #server-holds]]
**¿Qué contiene una fila?** Cada fila almacena el tipo de evento, el ID de la cuenta que actuó, el ticket afectado (cuando aplica), un objeto JSON de metadatos y una marca de tiempo de creación. Los cinco campos son texto plano. Ninguno contiene nombres, números de teléfono ni contenido de mensajes. El nombre visible del actor junto a cada fila es texto cifrado con la clave de la organización que el navegador descifra en el momento de la lectura. Las acciones que el sistema realiza por sí mismo se registran bajo un actor fijo con UUID nulo en lugar de la cuenta de una persona. [Feed de actividad](#dashboard/activity) trata cómo el panel presenta estas filas. [[#privacy #encryption]]
**¿Qué revela el registro completo?** Las filas, tomadas en conjunto, forman una cronología operativa. Muestran qué cuentas actuaron y cuándo, con qué frecuencia se abrieron o cerraron tickets, cuándo se modificaron los permisos de roles y cuándo se rotaron las claves de cifrado. Ninguna fila nombra a un cliente ni contiene contenido de mensajes. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano en otras partes del esquema. [[#metadata #server-holds]]
**El servicio de consulta y sus filtros.** \`query\` en \`packages/server/src/tickets/audit.ts\` devuelve filas de la más reciente a la más antigua, cincuenta por página de forma predeterminada. Se puede filtrar por tipo de evento, actor, ticket o rango de fechas, y la consulta de conteo aplica el mismo filtrado. Una inserción de auditoría fallida no bloquea la operación que produjo el evento, pero el fallo se hace visible para que un vacío en el registro sea detectable. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àùdìt lòg rècòrds àdmìnìstràtìvè ànd lìfècyclè àctìòns tàkèn ìn thè òrgànìzàtìòn. Èntrìès àrè ònly èvèr àddèd. Thè sèrvìcè hàs nò ùpdàtè pàth ànd nò dèlètè pàth, sò nòthìng wrìttèn càn bè àltèrèd àftèrwàrd. Vìèwìng thè lòg rèqùìrès thè Vìèw àùdìt lòg pèrmìssìòn. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw pèrmìssìòns àrè gràntèd. [[#pèrmìssìòns #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à ròw hòld? •••••••** Èàch ròw stòrès thè èvènt typè, thè àctìng àccòùnt's ÌD, thè àffèctèd tìckèt (whèn àpplìcàblè), à JSÒN mètàdàtà pàylòàd, ànd à crèàtìòn tìmèstàmp. Àll fìvè fìèlds àrè plàìntèxt. Nònè òf thèm càrry nàmès, phònè nùmbèrs, òr mèssàgè còntènt. Thè àctòr's dìsplày nàmè bèsìdè èàch ròw ìs òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts àt rèàd tìmè. Àctìòns thè systèm pèrfòrms òn ìts òwn àrè lòggèd ùndèr à fìxèd nìl-ÙÙÌD àctòr ràthèr thàn àny pèrsòn's àccòùnt. [Àctìvìty fèèd](#dàshbòàrd/àctìvìty) còvèrs hòw thè dàshbòàrd prèsènts thèsè ròws. [[#prìvàcy #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè fùll lòg rèvèàl? •••••••••** Thè ròws, tàkèn tògèthèr, àrè àn òpèràtìònàl tìmèlìnè. Thèy shòw whìch àccòùnts àctèd ànd whèn, hòw frèqùèntly tìckèts wèrè òpènèd òr clòsèd, whèn ròlè pèrmìssìòns wèrè mòdìfìèd, ànd whèn èncryptìòn kèys wèrè ròtàtèd. Nò ròw nàmès à clìènt òr càrrìès mèssàgè còntènt. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thè plàìntèxt còlùmns èlsèwhèrè ìn thè schèmà. [[#mètàdàtà #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè qùèry sèrvìcè ànd ìts fìltèrs. •••••••••••** \`qùèry\` ìn \`pàckàgès/sèrvèr/src/tìckèts/àùdìt.ts\` rètùrns ròws nèwèst fìrst, fìfty pèr pàgè by dèfàùlt. Thè càllèr càn nàrròw by èvènt typè, àctòr, tìckèt, òr dàtè ràngè, ànd thè còùnt qùèry àpplìès thè sàmè nàrròwìng. À fàìlèd àùdìt ìnsèrt dòès nòt blòck thè òpèràtìòn thàt pròdùcèd thè èvènt, bùt thè fàìlùrè ìs sùrfàcèd sò à gàp ìn thè lòg ìs vìsìblè. [[#fàìlùrè-stàtès]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The audit log records administrative and lifecycle actions taken in the organization. Entries are only ever added. The service has no update path and no dele..." |
*
* @param {Demo_Narrative_Admin_Audit_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_audit_log_body = /** @type {((inputs?: Demo_Narrative_Admin_Audit_Log_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Audit_Log_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_audit_log_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_audit_log_body(inputs)
	return en_demo_narrative_admin_audit_log_body(inputs)
});