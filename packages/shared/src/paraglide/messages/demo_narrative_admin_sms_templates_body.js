/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Sms_Templates_BodyInputs */

const en_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An SMS template is the text of an automatic reply, written once per language an organization serves. Auto-reply is sent to every inbound text. Error response can be written but no code path currently sends it. The server sends the auto-reply before any user sees the inbound message, so anyone who texts the organization's number receives one. The auto-reply is not stored on the ticket, so the conversation thread does not show what the sender was sent. [[#telephony]]
**Language fallback.** The server selects the template in the language stored for the sender's number, then the organization's default language, then a built-in English sentence ("Thank you for reaching out. A volunteer will follow up with you."). That fallback fires even when the organization has written no template at all. The reply leaves on the organization's own line, so a response from the sender reaches the same number. [[#failure-states]]
**Character limit.** Template text is capped at 1600 characters. The server rejects a save that exceeds the cap rather than truncating it. Providers split messages longer than 160 characters into multiple segments, and each segment is billed separately. [[#failure-states]]
**What does a database dump reveal?** The wording, the language and the template type are plaintext columns, with no client and no ticket attached. A dump gives the languages an organization serves and the exact text it sends to a stranger. The inbound message that triggered the reply is encrypted and stored as a follow-up under a per-ticket key. [[#server-holds #privacy]]
**The fallback function and the response table.** \`selectAutoReply\` in \`packages/server/src/telephony/sms-auto-reply.ts\` runs the language chain. \`packages/server/src/telephony/inbound-sms.ts\` sends the result after the inbound message has been encrypted and stored. The table is \`020_create_sms_responses.ts\`, unique on language and type. Editing a template requires the Write automatic replies permission. [[#permissions]]`)
};

const es_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una plantilla SMS es el texto de una respuesta automática, escrita una vez por cada idioma que atiende la organización. Respuesta automática se envía a cada texto entrante. Respuesta de error se puede redactar, pero ninguna ruta de código la envía actualmente. El servidor envía la respuesta automática antes de que ningún usuario vea el mensaje entrante, de modo que cualquier persona que envíe un texto al número de la organización recibe una. La respuesta automática no se almacena en el ticket, de modo que el hilo de conversación no refleja lo que se envió al remitente. [[#telephony]]
**Cadena de idiomas.** El servidor selecciona la plantilla en el idioma almacenado para el número del remitente, luego el idioma por defecto de la organización, y luego una frase integrada en inglés ("Thank you for reaching out. A volunteer will follow up with you."). Esa cadena se activa incluso cuando la organización no ha escrito ninguna plantilla. La respuesta sale por la línea propia de la organización, de modo que una contestación del remitente llega al mismo número. [[#failure-states]]
**Límite de caracteres.** El texto de la plantilla tiene un tope de 1600 caracteres. El servidor rechaza un guardado que exceda el tope en lugar de recortarlo. Los proveedores dividen los mensajes de más de 160 caracteres en varios segmentos, y cada segmento se factura por separado. [[#failure-states]]
**¿Qué revela un volcado de la base de datos?** La redacción, el idioma y el tipo de plantilla son columnas en texto plano, sin ningún cliente ni ningún ticket asociado. Un volcado da los idiomas que atiende la organización y el texto exacto que envía a una persona desconocida. El mensaje entrante que activó la respuesta se cifra y se guarda como seguimiento bajo una clave por ticket. [[#server-holds #privacy]]
**La función de cadena y la tabla de respuestas.** \`selectAutoReply\` en \`packages/server/src/telephony/sms-auto-reply.ts\` ejecuta la cadena de idiomas. \`packages/server/src/telephony/inbound-sms.ts\` envía el resultado después de que el mensaje entrante ha sido cifrado y almacenado. La tabla es \`020_create_sms_responses.ts\`, única por idioma y tipo. Editar una plantilla requiere el permiso Escribir respuestas automáticas. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn SMS tèmplàtè ìs thè tèxt òf àn àùtòmàtìc rèply, wrìttèn òncè pèr làngùàgè àn òrgànìzàtìòn sèrvès. Àùtò-rèply ìs sènt tò èvèry ìnbòùnd tèxt. Èrròr rèspònsè càn bè wrìttèn bùt nò còdè pàth cùrrèntly sènds ìt. Thè sèrvèr sènds thè àùtò-rèply bèfòrè àny ùsèr sèès thè ìnbòùnd mèssàgè, sò ànyònè whò tèxts thè òrgànìzàtìòn's nùmbèr rècèìvès ònè. Thè àùtò-rèply ìs nòt stòrèd òn thè tìckèt, sò thè cònvèrsàtìòn thrèàd dòès nòt shòw whàt thè sèndèr wàs sènt. [[#tèlèphòny]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Làngùàgè fàllbàck. ••••••** Thè sèrvèr sèlècts thè tèmplàtè ìn thè làngùàgè stòrèd fòr thè sèndèr's nùmbèr, thèn thè òrgànìzàtìòn's dèfàùlt làngùàgè, thèn à bùìlt-ìn Ènglìsh sèntèncè ("Thànk yòù fòr rèàchìng òùt. À vòlùntèèr wìll fòllòw ùp wìth yòù."). Thàt fàllbàck fìrès èvèn whèn thè òrgànìzàtìòn hàs wrìttèn nò tèmplàtè àt àll. Thè rèply lèàvès òn thè òrgànìzàtìòn's òwn lìnè, sò à rèspònsè fròm thè sèndèr rèàchès thè sàmè nùmbèr. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Chàràctèr lìmìt. •••••** Tèmplàtè tèxt ìs càppèd àt 1600 chàràctèrs. Thè sèrvèr rèjècts à sàvè thàt èxcèèds thè càp ràthèr thàn trùncàtìng ìt. Pròvìdèrs splìt mèssàgès lòngèr thàn 160 chàràctèrs ìntò mùltìplè sègmènts, ànd èàch sègmènt ìs bìllèd sèpàràtèly. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à dàtàbàsè dùmp rèvèàl? ••••••••••** Thè wòrdìng, thè làngùàgè ànd thè tèmplàtè typè àrè plàìntèxt còlùmns, wìth nò clìènt ànd nò tìckèt àttàchèd. À dùmp gìvès thè làngùàgès àn òrgànìzàtìòn sèrvès ànd thè èxàct tèxt ìt sènds tò à stràngèr. Thè ìnbòùnd mèssàgè thàt trìggèrèd thè rèply ìs èncryptèd ànd stòrèd às à fòllòw-ùp ùndèr à pèr-tìckèt kèy. [[#sèrvèr-hòlds #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fàllbàck fùnctìòn ànd thè rèspònsè tàblè. ••••••••••••••** \`sèlèctÀùtòRèply\` ìn \`pàckàgès/sèrvèr/src/tèlèphòny/sms-àùtò-rèply.ts\` rùns thè làngùàgè chàìn. \`pàckàgès/sèrvèr/src/tèlèphòny/ìnbòùnd-sms.ts\` sènds thè rèsùlt àftèr thè ìnbòùnd mèssàgè hàs bèèn èncryptèd ànd stòrèd. Thè tàblè ìs \`020_crèàtè_sms_rèspònsès.ts\`, ùnìqùè òn làngùàgè ànd typè. Èdìtìng à tèmplàtè rèqùìrès thè Wrìtè àùtòmàtìc rèplìès pèrmìssìòn. [[#pèrmìssìòns]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An SMS template is the text of an automatic reply, written once per language an organization serves. Auto-reply is sent to every inbound text. Error response..." |
*
* @param {Demo_Narrative_Admin_Sms_Templates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_sms_templates_body = /** @type {((inputs?: Demo_Narrative_Admin_Sms_Templates_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Sms_Templates_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_sms_templates_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_sms_templates_body(inputs)
	return en_demo_narrative_admin_sms_templates_body(inputs)
});