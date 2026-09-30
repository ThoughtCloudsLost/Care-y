/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Responses_BodyInputs */

const en_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The viewer lists submissions for one custom form, newest first, twenty-five at a time. Each row arrives encrypted and decrypts in the browser. Viewing requires the View intake responses permission and a completed second factor. The built-in default form collects no structured response, so its submissions have no row here. [[#permissions #encryption]]
**What does the server store in the clear?** Each row holds the ticket it created, the form it belongs to and the time it arrived. Those three plaintext columns show how many submissions a form has received and when each one landed. The encrypted column holds the answers. A database dump reveals submission counts and timing and nothing about who submitted or what they wrote. [Form settings](#admin-forms/form-settings) covers which form is which. [[#server-holds #metadata #portal]]
**The audit event.** Every listing writes an audit event naming the user who read, the form and how many rows came back. The event carries counts and the form's ID. It carries no answer content. [Audit log](#admin-logs/audit) covers the log and who has access to it. [[#metadata #privacy]]
**The listing service and the wrap backfill.** \`listResponses\` in \`packages/server/src/portal/intake-response-service.ts\` pages by keyset on arrival time and ticket ID, returning ciphertext with whichever key wrap the caller holds and a list of accounts that hold no wrap for that ticket. When a row decrypts, the browser mints wraps for those accounts in the crypto worker and submits them. The server validates every target against current queue membership and permission holders before inserting. [Unreadable response](#admin-responses/key-not-held) covers what leaves an account without a wrap. [[#keys]]`)
};

const es_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El visor enumera los envíos de un formulario personalizado, del más reciente al más antiguo, de veinticinco en veinticinco. Cada fila llega cifrada y se descifra en el navegador. Consultar los envíos exige el permiso Ver respuestas de ingreso y un segundo factor completado. El formulario predeterminado integrado no recoge respuestas estructuradas, así que sus envíos no generan filas aquí. [[#permissions #encryption]]
**¿Qué guarda el servidor en texto plano?** Cada fila guarda el ticket que creó, el formulario al que pertenece y la hora en que llegó. Esas tres columnas en texto plano muestran cuántos envíos ha recibido un formulario y cuándo aterrizó cada uno. La columna cifrada contiene las respuestas. Un volcado de base de datos revela recuentos de envíos y marcas de tiempo, pero nada sobre quién envió ni qué escribió. [Configuración del formulario](#admin-forms/form-settings) trata cuál es cada formulario. [[#server-holds #metadata #portal]]
**El evento de auditoría.** Cada listado escribe un evento de auditoría con la persona usuaria que consultó, el formulario y cuántas filas se devolvieron. El evento lleva recuentos y el ID del formulario. No lleva contenido de respuestas. [Registro de auditoría](#admin-logs/audit) trata el registro y quién tiene acceso a él. [[#metadata #privacy]]
**El servicio de listado y el relleno de envoltorios.** \`listResponses\`, en \`packages/server/src/portal/intake-response-service.ts\`, pagina por clave sobre la hora de llegada y el ID del ticket, y devuelve texto cifrado con el envoltorio de clave que tenga quien consulta y una lista de cuentas sin envoltorio para ese ticket. Cuando una fila se descifra, el navegador genera envoltorios para esas cuentas en el worker criptográfico y los envía. El servidor valida cada destinatario contra la membresía actual de colas y los titulares del permiso antes de insertarlos. [Respuesta ilegible](#admin-responses/key-not-held) trata qué deja a una cuenta sin envoltorio. [[#keys]]`)
};

const en_xa2_demo_narrative_admin_form_responses_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Responses_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè vìèwèr lìsts sùbmìssìòns fòr ònè cùstòm fòrm, nèwèst fìrst, twènty-fìvè àt à tìmè. Èàch ròw àrrìvès èncryptèd ànd dècrypts ìn thè bròwsèr. Vìèwìng rèqùìrès thè Vìèw ìntàkè rèspònsès pèrmìssìòn ànd à còmplètèd sècònd fàctòr. Thè bùìlt-ìn dèfàùlt fòrm còllècts nò strùctùrèd rèspònsè, sò ìts sùbmìssìòns hàvè nò ròw hèrè. [[#pèrmìssìòns #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr stòrè ìn thè clèàr? ••••••••••••** Èàch ròw hòlds thè tìckèt ìt crèàtèd, thè fòrm ìt bèlòngs tò ànd thè tìmè ìt àrrìvèd. Thòsè thrèè plàìntèxt còlùmns shòw hòw màny sùbmìssìòns à fòrm hàs rècèìvèd ànd whèn èàch ònè làndèd. Thè èncryptèd còlùmn hòlds thè ànswèrs. À dàtàbàsè dùmp rèvèàls sùbmìssìòn còùnts ànd tìmìng ànd nòthìng àbòùt whò sùbmìttèd òr whàt thèy wròtè. [Fòrm sèttìngs](#àdmìn-fòrms/fòrm-sèttìngs) còvèrs whìch fòrm ìs whìch. [[#sèrvèr-hòlds #mètàdàtà #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè àùdìt èvènt. •••••** Èvèry lìstìng wrìtès àn àùdìt èvènt nàmìng thè ùsèr whò rèàd, thè fòrm ànd hòw màny ròws càmè bàck. Thè èvènt càrrìès còùnts ànd thè fòrm's ÌD. Ìt càrrìès nò ànswèr còntènt. [Àùdìt lòg](#àdmìn-lògs/àùdìt) còvèrs thè lòg ànd whò hàs àccèss tò ìt. [[#mètàdàtà #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè lìstìng sèrvìcè ànd thè wràp bàckfìll. •••••••••••••** \`lìstRèspònsès\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/ìntàkè-rèspònsè-sèrvìcè.ts\` pàgès by kèysèt òn àrrìvàl tìmè ànd tìckèt ÌD, rètùrnìng cìphèrtèxt wìth whìchèvèr kèy wràp thè càllèr hòlds ànd à lìst òf àccòùnts thàt hòld nò wràp fòr thàt tìckèt. Whèn à ròw dècrypts, thè bròwsèr mìnts wràps fòr thòsè àccòùnts ìn thè cryptò wòrkèr ànd sùbmìts thèm. Thè sèrvèr vàlìdàtès èvèry tàrgèt àgàìnst cùrrènt qùèùè mèmbèrshìp ànd pèrmìssìòn hòldèrs bèfòrè ìnsèrtìng. [Ùnrèàdàblè rèspònsè](#àdmìn-rèspònsès/kèy-nòt-hèld) còvèrs whàt lèàvès àn àccòùnt wìthòùt à wràp. [[#kèys]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The viewer lists submissions for one custom form, newest first, twenty-five at a time. Each row arrives encrypted and decrypts in the browser. Viewing requir..." |
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