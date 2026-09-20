/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Audit_Log_BodyInputs */

const en_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The audit log records 47 event types spanning the full range of administrative and lifecycle actions across the organization.
**What the server holds.** The audit service accepts only appends with no update or delete path and stores identifiers only, never names, phone numbers, or ticket content. The actor's display name is resolved from an identifier and decrypted in the browser with the organization key.
**Filters.** Filter selections for event type, actor, and date range are sent to the server as query parameters.
**Persistence.** Audit entries are exempt from the data retention policy because they serve as the organization's operational record.
**Permissions.** The View reports permission gates the logs page, and the View audit log permission gates the audit tab within it. View audit log is a default manager permission.`)
};

const es_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El registro de auditoría registra 47 tipos de evento que abarcan toda la gama de acciones administrativas y del ciclo de vida en la organización.
**Lo que almacena el servidor.** El servicio de auditoría solo acepta inserciones, sin ruta de actualización ni eliminación, y almacena solo identificadores, nunca nombres, números de teléfono ni contenido de tickets. El nombre visible del actor se resuelve a partir de un identificador y se descifra en el navegador con la clave de la organización.
**Filtros.** Las selecciones de filtro por tipo de evento, actor y rango de fechas se envían al servidor como parámetros de consulta.
**Persistencia.** Las entradas de auditoría están exentas de la política de retención de datos porque sirven como el registro operativo de la organización.
**Permisos.** El permiso Ver reportes y estadísticas controla el acceso a la página de registros, y el permiso Leer el registro de auditoría controla la pestaña de auditoría dentro de ella. Leer el registro de auditoría es un valor predeterminado de gestor.`)
};

const en_xa2_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àùdìt lòg rècòrds 47 èvènt typès spànnìng thè fùll ràngè òf àdmìnìstràtìvè ànd lìfècyclè àctìòns àcròss thè òrgànìzàtìòn.
 ••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè àùdìt sèrvìcè àccèpts ònly àppènds wìth nò ùpdàtè òr dèlètè pàth ànd stòrès ìdèntìfìèrs ònly, nèvèr nàmès, phònè nùmbèrs, òr tìckèt còntènt. Thè àctòr's dìsplày nàmè ìs rèsòlvèd fròm àn ìdèntìfìèr ànd dècryptèd ìn thè bròwsèr wìth thè òrgànìzàtìòn kèy.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìltèrs. •••** Fìltèr sèlèctìòns fòr èvènt typè, àctòr, ànd dàtè ràngè àrè sènt tò thè sèrvèr às qùèry pàràmètèrs.
 •••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Àùdìt èntrìès àrè èxèmpt fròm thè dàtà rètèntìòn pòlìcy bècàùsè thèy sèrvè às thè òrgànìzàtìòn's òpèràtìònàl rècòrd.
 ••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Thè Vìèw rèpòrts pèrmìssìòn gàtès thè lògs pàgè, ànd thè Vìèw àùdìt lòg pèrmìssìòn gàtès thè àùdìt tàb wìthìn ìt. Vìèw àùdìt lòg ìs à dèfàùlt mànàgèr pèrmìssìòn. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The audit log records 47 event types spanning the full range of administrative and lifecycle actions across the organization. **What the server holds.** The ..." |
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