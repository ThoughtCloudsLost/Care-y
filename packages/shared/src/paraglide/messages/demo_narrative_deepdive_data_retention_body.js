/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Data_Retention_BodyInputs */

const en_demo_narrative_deepdive_data_retention_body = /** @type {(inputs: Demo_Narrative_Deepdive_Data_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Data an organization no longer needs can still be taken from it. For a population targeted by a state-level adversary, a case record from three years ago remains a live risk to a person who may have moved, changed names, or gone quiet. Encryption protects what is stored; retention decides whether it is stored at all. The two are different defenses and an organization needs both. [[#retention #privacy]]
Automatic deletion is off until an administrator turns it on, and turning it on means choosing a window between 1 and 3,650 days. Cases, messages and caller personal information older than that window are deleted permanently. Both enabling the policy and changing the number ask for confirmation, and the confirmation says plainly that deleted data cannot be recovered even from the escrow file, because escrow protects keys and not rows. With the policy off, everything is kept until someone deletes it by hand. [[#retention]]
The policy is one setting for the whole organization rather than a choice per queue or per case type, and the reasoning is that a per-queue window is a decision someone has to remember correctly on the day they create a queue. Audit entries are exempt, so the record that something happened outlives the content of what happened. Configuring the policy requires the Manage retention permission, which sits with Admin by default and can be moved. [The permission system](#deep-dive/the-permission-system) explains how that moves. [[#retention #permissions]]
Retention cannot delete what a third party holds. It also cannot delete a copy a client kept on their own phone, and for clients on a monitored device that copy is often the more dangerous one, which is why the client-facing surfaces carry a quick exit and why the encrypted channels avoid third parties in the first place. And deletion only runs one way; nothing the policy removes can be restored. [[#retention #failure-states]]
**Separate lifetimes already running.** Three other clocks delete data independently of the organization-wide window. [[#retention #portal #telephony]]
- Portal message copies on the client side are deleted after 30 days of channel inactivity, measured from the later of the last-seen and created timestamps, and that sweep removes portal messages, portal attachments and portal recordings while leaving the organization's own record intact. [[#retention #portal]]
- One-time share links expire 72 hours after creation or on first read, whichever comes first, and the ciphertext column is cleared at read time while the row survives as a tombstone until an expiry sweep removes it. [[#retention #portal]]
- Telephony logs are deleted at the provider, because CARE-Y asks the provider to delete each call, message or recording log after processing, with retries when the request fails. [[#retention #telephony]]
**What survives a deletion.** A deletion removes content while structural traces remain. [[#retention #metadata #server-holds]]
- Audit rows keep their event type, actor id, case id and timestamp. [[#retention #metadata]]
- Foreign key relationships and row counts remain readable in the tables that are left. [[#retention #metadata]]
- A deleted case removes its own ciphertext and its key wraps, and a key wrap without its case is not recoverable. [[#retention #encryption]]
- Escrow holds key material rather than data, so no escrow ceremony brings back a deleted row. [[#retention #keys]]
**Contributor pointers.** The setting and the sweeps live apart from each other. [[#retention]]
- The organization-wide window is \`org_config.pii_retention_days\`, an integer column from \`packages/server/src/db/migrations/tenant/003_create_org_config.ts\`, written through \`setPiiRetentionDays\` in \`packages/server/src/auth/service.ts\` behind a permission-gated tRPC procedure in \`packages/server/src/routes/auth.ts\`, and read back for display through the hub status query. [[#retention #permissions]]
- The independent sweeps live in \`packages/server/src/jobs/\`, where \`portal-message-expiry.ts\` handles the 30-day portal window across tenant schemas and \`log-deletion.ts\` dispatches provider log deletions with backoff. [[#retention #portal #telephony]]
- Share link expiry logic is in \`packages/server/src/portal/share-service.ts\`. [[#retention #portal]]`)
};

const es_demo_narrative_deepdive_data_retention_body = /** @type {(inputs: Demo_Narrative_Deepdive_Data_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los datos que una organización ya no necesita todavía se le pueden arrebatar. Para una población perseguida por un adversario con recursos de un estado, un expediente de caso de hace tres años sigue siendo un riesgo vivo para una persona que puede haberse mudado, haber cambiado de nombre o haber callado. El cifrado protege lo que está almacenado; la retención decide si se almacena en absoluto. Son dos defensas distintas y una organización necesita las dos. [[#retention #privacy]]
La eliminación automática está apagada hasta que una persona administradora la enciende, y encenderla implica elegir una ventana de entre 1 y 3.650 días. Los casos, los mensajes y los datos personales de quien llama que sean más antiguos que esa ventana se eliminan de forma permanente. Tanto activar la política como cambiar el número piden confirmación, y la confirmación dice con claridad que los datos eliminados no se pueden recuperar ni desde el archivo de custodia, porque la custodia protege claves y no filas. Con la política apagada, todo se conserva hasta que alguien lo elimina a mano. [[#retention]]
La política es un único ajuste para toda la organización y no una elección por cola o por tipo de caso, y el razonamiento es que una ventana por cola es una decisión que alguien tiene que recordar correctamente el día en que crea una cola. Las entradas de auditoría están exentas, así que el registro de que algo ocurrió sobrevive al contenido de lo que ocurrió. Configurar la política requiere el permiso Definir cuánto tiempo se conservan los datos, que está con Administrador de forma predeterminada y se puede mover. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo se mueve. [[#retention #permissions]]
La retención no puede eliminar lo que tiene una tercera parte. Tampoco puede eliminar una copia que un cliente guardó en su propio teléfono, y para los clientes con un dispositivo vigilado esa copia es a menudo la más peligrosa, y por eso las superficies de cara al cliente llevan una salida rápida y por eso los canales cifrados evitan a las terceras partes desde el principio. Y la eliminación corre en un solo sentido; nada de lo que la política quita se puede restaurar. [[#retention #failure-states]]
**Vidas separadas que ya corren.** Otros tres relojes eliminan datos con independencia de la ventana de toda la organización. [[#retention #portal #telephony]]
- Las copias de mensajes del portal del lado del cliente se eliminan tras 30 días de inactividad del canal, medidos desde la más tardía de las marcas de última vista y de creación, y ese barrido retira los mensajes del portal, los adjuntos del portal y las grabaciones del portal mientras deja intacto el registro propio de la organización. [[#retention #portal]]
- Los enlaces de compartición de un solo uso caducan 72 horas después de su creación o en la primera lectura, lo que ocurra primero, y la columna de texto cifrado se vacía en el momento de la lectura mientras la fila sobrevive como lápida hasta que un barrido de caducidad la retira. [[#retention #portal]]
- Los registros de telefonía se eliminan en el proveedor, porque CARE-Y pide al proveedor que elimine cada registro de llamada, mensaje o grabación después de procesarlo, con reintentos cuando la solicitud falla. [[#retention #telephony]]
**Qué sobrevive a una eliminación.** Una eliminación retira el contenido mientras quedan rastros estructurales. [[#retention #metadata #server-holds]]
- Las filas de auditoría conservan su tipo de evento, el identificador del actor, el identificador del caso y la marca de tiempo. [[#retention #metadata]]
- Las relaciones de claves externas y el número de filas siguen siendo legibles en las tablas que quedan. [[#retention #metadata]]
- Un caso eliminado retira su propio texto cifrado y sus envolturas de clave, y una envoltura de clave sin su caso no es recuperable. [[#retention #encryption]]
- La custodia guarda material de claves y no datos, así que ninguna ceremonia de custodia devuelve una fila eliminada. [[#retention #keys]]
**Indicaciones para quien contribuye.** El ajuste y los barridos viven separados entre sí. [[#retention]]
- La ventana de toda la organización es \`org_config.pii_retention_days\`, una columna entera de \`packages/server/src/db/migrations/tenant/003_create_org_config.ts\`, escrita mediante \`setPiiRetentionDays\` en \`packages/server/src/auth/service.ts\` detrás de un procedimiento tRPC protegido por permiso en \`packages/server/src/routes/auth.ts\`, y leída de vuelta para mostrarla mediante la consulta de estado del hub. [[#retention #permissions]]
- Los barridos independientes viven en \`packages/server/src/jobs/\`, donde \`portal-message-expiry.ts\` se encarga de la ventana de 30 días del portal en todos los esquemas de inquilino y \`log-deletion.ts\` despacha las eliminaciones de registros del proveedor con reintentos escalonados. [[#retention #portal #telephony]]
- La lógica de caducidad de los enlaces de compartición está en \`packages/server/src/portal/share-service.ts\`. [[#retention #portal]]`)
};

/**
* | output |
* | --- |
* | "Data an organization no longer needs can still be taken from it. For a population targeted by a state-level adversary, a case record from three years ago rem..." |
*
* @param {Demo_Narrative_Deepdive_Data_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_data_retention_body = /** @type {((inputs?: Demo_Narrative_Deepdive_Data_Retention_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Data_Retention_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_data_retention_body(inputs)
	return en_demo_narrative_deepdive_data_retention_body(inputs)
});