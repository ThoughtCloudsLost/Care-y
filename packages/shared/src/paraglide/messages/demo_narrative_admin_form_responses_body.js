/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Responses_BodyInputs */

const en_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The viewer lists the submissions one custom form has received, newest first, twenty-five at a time, and decrypts each one in the crypto worker as it arrives. Reading it takes permission to read intake submissions from every queue and a completed second factor. [[#permissions #encryption]]
**What a submission row holds.** One blob of encrypted answers, the ticket it created, the form it came from and the time it arrived. The three plaintext columns are enough to show how many submissions a form has taken and when each one landed, and nothing about who submitted or what they wrote. Submissions to the built-in default form produce no row here at all, since only a custom form records a structured response. [Form settings](#admin-forms/form-settings) covers which form is which. [[#server-holds #metadata #portal]]
**Answers whose question is gone.** Each answer is stored against the field key it was given at submission, and the form definition it belonged to can change afterwards. An answer whose field has since been removed is shown with its raw key and a marker rather than dropped, so editing a form never destroys what people already sent. [The form builder](#admin-forms/builder) covers field keys and what a save does to them. [[#client-data]]
**What reading one writes.** Every listing writes an audit event naming the account that read, the form and how many rows came back, which makes this surface one of the few reads the log records at all. The event carries counts and identifiers and no answer content. [Audit log](#admin-logs/audit) covers the log and who has access to it. [[#metadata #privacy]]
**The listing service and the backfill it triggers.** \`listResponses\` in \`packages/server/src/portal/intake-response-service.ts\` pages by keyset on the arrival time and the ticket id, returning ciphertext with whichever key wrap the caller can use and a list of principals that hold no wrap for that ticket. When a row decrypts, the browser mints wraps for those principals in the worker and submits them, and the server validates every target before inserting. [Unreadable response](#admin-responses/key-not-held) covers what makes a principal missing in the first place. [[#keys]]`)
};

const es_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El visor enumera los envíos que ha recibido un formulario personalizado, del más reciente al más antiguo, de veinticinco en veinticinco, y descifra cada uno en el worker criptográfico a medida que llegan. Leerlo exige el permiso para leer respuestas de ingreso de todas las colas y un segundo factor completado. [[#permissions #encryption]]
**Lo que guarda la fila de un envío.** Un bloque de respuestas cifradas, el ticket que creó, el formulario del que vino y la hora en que llegó. Las tres columnas en texto plano bastan para mostrar cuántos envíos ha recibido un formulario y cuándo aterrizó cada uno, y nada sobre quién envió ni qué escribió. Los envíos al formulario predeterminado integrado no producen ninguna fila aquí, porque solo un formulario personalizado registra una respuesta estructurada. [Ajustes del formulario](#admin-forms/form-settings) trata qué formulario es cuál. [[#server-holds #metadata #portal]]
**Respuestas cuya pregunta ya no está.** Cada respuesta se guarda contra la clave de campo que recibió en el envío, y la definición del formulario a la que pertenecía puede cambiar después. Una respuesta cuyo campo se eliminó desde entonces se muestra con su clave original y un marcador en lugar de descartarse, así que editar un formulario nunca destruye lo que ya se envió. [El constructor de formularios](#admin-forms/builder) trata las claves de campo y lo que hace con ellas un guardado. [[#client-data]]
**Lo que escribe una lectura.** Cada listado escribe un evento de auditoría con la cuenta que leyó, el formulario y cuántas filas se devolvieron, lo que convierte a esta superficie en una de las pocas lecturas que el registro anota. El evento lleva recuentos e identificadores y ningún contenido de respuesta. [Registro de auditoría](#admin-logs/audit) trata el registro y quién tiene acceso a él. [[#metadata #privacy]]
**El servicio de listado y el relleno que dispara.** \`listResponses\`, en \`packages/server/src/portal/intake-response-service.ts\`, pagina por clave sobre la hora de llegada y el identificador del ticket, y devuelve texto cifrado con el envoltorio de clave que pueda usar quien consulta y una lista de personas que no tienen envoltorio para ese ticket. Cuando una fila se descifra, el navegador genera envoltorios para ellas en el worker y los envía, y el servidor valida cada destinatario antes de insertarlos. [Respuesta ilegible](#admin-responses/key-not-held) trata qué deja a alguien fuera en primer lugar. [[#keys]]`)
};

const en_xa2_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùbmìttèd ìntàkè fòrms àppèàr às càrds ìn thè rèspònsè vìèwèr. À fìèld whòsè dèfìnìtìòn hàs sìncè bèèn rèmòvèd fròm thè fòrm shòws à màrkèr ànd ìts ràw kèy ràthèr thàn dìsàppèàrìng, sò nò sùbmìssìòn dàtà ìs sìlèntly lòst.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Rèspònsè fìèlds àrè èncryptèd àt sùbmìssìòn tìmè ànd dècryptèd ìn thè bròwsèr. Whèn thè bròwsèr dècrypts à rèspònsè ànd fìnds thàt òthèr ùsèrs hàvè nò wràppèd còpy òf thè kèy, ìt mìnts wràps fòr thèm ìn thè bàckgròùnd wìthòùt blòckìng thè vìèwèr.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng ìntàkè rèspònsès rèqùìrès thè Vìèw ìntàkè rèspònsès pèrmìssìòn, whìch ìs àn àdmìnìstràtòr dèfàùlt ànd càrrìès à trùst nòtè bècàùsè ìt grànts dècryptìòn àcròss qùèùès. •••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The viewer lists the submissions one custom form has received, newest first, twenty-five at a time, and decrypts each one in the crypto worker as it arrives...." |
*
* @param {Demo_Narrative_Admin_Form_Responses_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_responses_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Responses_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Responses_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_responses_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_responses_body(inputs)
	return en_demo_narrative_admin_form_responses_body(inputs)
});