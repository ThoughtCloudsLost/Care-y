/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Call_Log_BodyInputs */

const en_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No phone number appears anywhere in the call log. The client alias on each row is decrypted in the browser with the organization key and is the only encrypted value. The server reads plaintext metadata for timestamps, duration, and status without accessing any encrypted content.
**Filters.** Filter selections for direction, call status, and date range are sent to the server as query parameters.
**Permissions.** Viewing the call log requires the View reports permission, which gates the entire logs page.`)
};

const es_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningún número de teléfono aparece en el registro de llamadas. El alias del cliente en cada fila se descifra en el navegador con la clave de la organización y es el único valor cifrado. El servidor lee metadatos en texto plano para marcas de tiempo, duración y estado sin acceder a ningún contenido cifrado.
**Filtros.** Las selecciones de filtro por dirección, estado de llamada y rango de fechas se envían al servidor como parámetros de consulta.
**Permisos.** Ver el registro de llamadas requiere el permiso Ver reportes y estadísticas, que controla el acceso a toda la página de registros.`)
};

const en_xa2_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò phònè nùmbèr àppèàrs ànywhèrè ìn thè càll lòg. Thè clìènt àlìàs òn èàch ròw ìs dècryptèd ìn thè bròwsèr wìth thè òrgànìzàtìòn kèy ànd ìs thè ònly èncryptèd vàlùè. Thè sèrvèr rèàds plàìntèxt mètàdàtà fòr tìmèstàmps, dùràtìòn, ànd stàtùs wìthòùt àccèssìng àny èncryptèd còntènt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìltèrs. •••** Fìltèr sèlèctìòns fòr dìrèctìòn, càll stàtùs, ànd dàtè ràngè àrè sènt tò thè sèrvèr às qùèry pàràmètèrs.
 ••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng thè càll lòg rèqùìrès thè Vìèw rèpòrts pèrmìssìòn, whìch gàtès thè èntìrè lògs pàgè. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No phone number appears anywhere in the call log. The client alias on each row is decrypted in the browser with the organization key and is the only encrypte..." |
*
* @param {Demo_Narrative_Admin_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_call_log_body = /** @type {((inputs?: Demo_Narrative_Admin_Call_Log_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Call_Log_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_call_log_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_call_log_body(inputs)
	return en_demo_narrative_admin_call_log_body(inputs)
});