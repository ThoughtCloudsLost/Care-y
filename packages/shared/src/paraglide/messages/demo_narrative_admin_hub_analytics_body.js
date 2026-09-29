/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Analytics_BodyInputs */

const en_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The analytics group collects the reporting and logging destinations under separate permission gates. [[#permissions #metadata]]
- The Impact, Operations, and Research dashboards and [Call history](#admin-logs/calls) require the View reports permission.
- [Audit log](#admin-logs/audit) requires the View audit log permission, so an organization can grant charting and call records without exposing who performed which action.
**What do the dashboards read?** Server-side charts aggregate plaintext metadata.
- Ticket counts
- Timestamps
- Queue assignments
- Priority levels
- Resolution times Volunteer names and queue names are organization-key ciphertext that the browser decrypts for chart labels. A separate set of charts decrypts ticket content in the browser to extract topic keywords and conversation patterns, and sends nothing decrypted to the server. Those charts can analyze only tickets the viewer holds keys for, so two users with access to different queues see different figures. [[#server-holds #encryption]]
**Dashboard configuration.** Each organization has three dashboard tabs whose names, chart selections, and display order are encrypted with the organization key and stored as a single blob in the organization record. The server holds the ciphertext and cannot read which charts an organization has chosen or what it has named its tabs. Every user with the View reports permission sees the same three dashboards. [[#encryption #privacy]]`)
};

const es_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de analíticas reúne los destinos de informes y de registros bajo permisos separados. [[#permissions #metadata]]
- Los paneles Impacto, Operaciones y Estudios y el [Historial de llamadas](#admin-logs/calls) requieren el permiso Ver reportes.
- El [Registro de auditoría](#admin-logs/audit) requiere el permiso Ver registro de auditoría, así que una organización puede conceder gráficos y registros de llamadas sin exponer quién realizó cada acción.
**¿Qué leen los paneles?** Los gráficos del lado del servidor agregan metadatos en texto plano.
- Conteos de tickets
- Marcas de tiempo
- Asignaciones de cola
- Niveles de prioridad
- Tiempos de resolución Los nombres de las personas voluntarias y los nombres de las colas son texto cifrado con la clave de la organización que el navegador descifra para las etiquetas de los gráficos. Un conjunto aparte de gráficos descifra el contenido de los tickets en el navegador para extraer palabras clave temáticas y patrones de conversación, y no envía nada descifrado al servidor. Esos gráficos solo pueden analizar los tickets para los cuales quien observa tiene claves, así que dos personas con acceso a colas distintas ven cifras diferentes. [[#server-holds #encryption]]
**Configuración de los paneles.** Cada organización tiene tres pestañas de panel cuyos nombres, selecciones de gráficos y orden de presentación se cifran con la clave de la organización y se almacenan como un solo bloque en el registro de la organización. El servidor guarda el texto cifrado y no puede leer qué gráficos ha elegido una organización ni cómo ha nombrado sus pestañas. Todas las personas con el permiso Ver reportes ven los mismos tres paneles. [[#encryption #privacy]]`)
};

const en_xa2_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ànàlytìcs gròùp còllècts thè rèpòrtìng ànd lòggìng dèstìnàtìòns ùndèr sèpàràtè pèrmìssìòn gàtès. [[#pèrmìssìòns #mètàdàtà]]
- Thè Ìmpàct, Òpèràtìòns, ànd Rèsèàrch dàshbòàrds ànd [Càll hìstòry](#àdmìn-lògs/càlls) rèqùìrè thè Vìèw rèpòrts pèrmìssìòn.
- [Àùdìt lòg](#àdmìn-lògs/àùdìt) rèqùìrès thè Vìèw àùdìt lòg pèrmìssìòn, sò àn òrgànìzàtìòn càn grànt chàrtìng ànd càll rècòrds wìthòùt èxpòsìng whò pèrfòrmèd whìch àctìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dò thè dàshbòàrds rèàd? •••••••••** Sèrvèr-sìdè chàrts àggrègàtè plàìntèxt mètàdàtà.
- Tìckèt còùnts
- Tìmèstàmps
- Qùèùè àssìgnmènts
- Prìòrìty lèvèls
- Rèsòlùtìòn tìmès Vòlùntèèr nàmès ànd qùèùè nàmès àrè òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts fòr chàrt làbèls. À sèpàràtè sèt òf chàrts dècrypts tìckèt còntènt ìn thè bròwsèr tò èxtràct tòpìc kèywòrds ànd cònvèrsàtìòn pàttèrns, ànd sènds nòthìng dècryptèd tò thè sèrvèr. Thòsè chàrts càn ànàlyzè ònly tìckèts thè vìèwèr hòlds kèys fòr, sò twò ùsèrs wìth àccèss tò dìffèrènt qùèùès sèè dìffèrènt fìgùrès. [[#sèrvèr-hòlds #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dàshbòàrd cònfìgùràtìòn. ••••••••** Èàch òrgànìzàtìòn hàs thrèè dàshbòàrd tàbs whòsè nàmès, chàrt sèlèctìòns, ànd dìsplày òrdèr àrè èncryptèd wìth thè òrgànìzàtìòn kèy ànd stòrèd às à sìnglè blòb ìn thè òrgànìzàtìòn rècòrd. Thè sèrvèr hòlds thè cìphèrtèxt ànd cànnòt rèàd whìch chàrts àn òrgànìzàtìòn hàs chòsèn òr whàt ìt hàs nàmèd ìts tàbs. Èvèry ùsèr wìth thè Vìèw rèpòrts pèrmìssìòn sèès thè sàmè thrèè dàshbòàrds. [[#èncryptìòn #prìvàcy]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The analytics group collects the reporting and logging destinations under separate permission gates. [[#permissions #metadata]] - The Impact, Operations, and..." |
*
* @param {Demo_Narrative_Admin_Hub_Analytics_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_analytics_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Analytics_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Analytics_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_analytics_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_analytics_body(inputs)
	return en_demo_narrative_admin_hub_analytics_body(inputs)
});