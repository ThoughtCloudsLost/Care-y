/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Greetings_BodyInputs */

const en_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greetings are what a caller hears on the way through a phone line, five of them for five points in the call, one for the answer, one for the language prompt, one for a caller with no case yet, one for a caller who already has one, and one for the staff menu. Each one is stored for a number and a language, so a line answers in the caller's language where a recording exists for it. [[#telephony]]
**Text or recording.** A greeting is either text the provider reads aloud or an uploaded recording in WAV, MP3 or OGG, up to five megabytes, and an upload is checked against the format's own signature bytes before storage so a file that claims to be audio and is not never reaches the store. Uploads are rate limited per account. [[#failure-states]]
**Why a greeting is not encrypted.** Every caller hears it, so the text and the recording are stored as the organization wrote them, and the provider fetches the recording over a public address whose only protection is an unguessable key the server generates. A greeting is outward-facing content in the same sense as the organization's branding, and it must never carry anything about a client or a case, since anyone holding the address can play it. [[#server-holds #privacy]]
**What the greeting row reveals.** The organization's own phone number sits in plaintext beside each greeting, along with the language, the greeting type and both timestamps, so a database dump of this table gives the numbers an organization answers on, the languages it serves and what it says on each line. This is the one place the tenant database records an organization's numbers. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns across the schema. [[#metadata #server-holds]]
**The greeting row and its two readers.** \`019_create_phone_greetings.ts\` with \`054_greeting_phone_number.ts\` keys a greeting on number, language and type, and \`packages/server/src/telephony/ivr.ts\` turns each one into a spoken line or a played file when a call arrives. The admin preview reads the same recording through an authenticated endpoint rather than the public address. Writing a greeting needs permission to write call greetings, and reaching the section needs permission to manage infrastructure. [[#permissions]]`)
};

const es_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los saludos son lo que escucha quien llama a medida que avanza por una línea telefónica, cinco para cinco momentos de la llamada, uno para la respuesta, uno para la selección de idioma, uno para quien todavía no tiene caso, uno para quien ya tiene uno y uno para el menú del personal. Cada uno se guarda para un número y un idioma, de modo que una línea responde en el idioma de quien llama cuando existe una grabación para él. [[#telephony]]
**Texto o grabación.** Un saludo es texto que el proveedor lee en voz alta o una grabación subida en WAV, MP3 u OGG, de hasta cinco megabytes, y cada subida se comprueba contra los bytes de firma del propio formato antes de guardarse, así que un archivo que dice ser audio sin serlo nunca llega al almacén. Las subidas tienen un límite de frecuencia por cuenta. [[#failure-states]]
**Por qué un saludo no se cifra.** Todas las personas que llaman lo escuchan, así que el texto y la grabación se guardan tal como los escribió la organización, y el proveedor descarga la grabación desde una dirección pública cuya única protección es una clave impredecible que genera el servidor. Un saludo es contenido dirigido al exterior en el mismo sentido que la imagen de la organización, y nunca debe llevar nada sobre un cliente ni sobre un caso, porque cualquiera que tenga la dirección puede reproducirlo. [[#server-holds #privacy]]
**Lo que revela la fila de un saludo.** El número de teléfono de la propia organización está en texto plano junto a cada saludo, con el idioma, el tipo de saludo y ambas marcas de tiempo, de modo que un volcado de esta tabla da los números en los que responde una organización, los idiomas que atiende y lo que dice en cada línea. Es el único lugar donde la base de datos del inquilino registra los números de una organización. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano de todo el esquema. [[#metadata #server-holds]]
**La fila del saludo y sus dos lectores.** \`019_create_phone_greetings.ts\`, junto con \`054_greeting_phone_number.ts\`, guarda un saludo bajo el número, el idioma y el tipo, y \`packages/server/src/telephony/ivr.ts\` convierte cada uno en una línea hablada o en un archivo reproducido cuando entra una llamada. La vista previa de administración lee esa misma grabación por un endpoint autenticado y no por la dirección pública. Escribir un saludo requiere permiso para escribir saludos de llamada, y llegar a la sección requiere permiso para gestionar la infraestructura. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grèètìngs àrè whàt càllèrs hèàr whèn thèy rèàch à phònè lìnè. Fìvè grèètìng typès èàch sèrvè à dìffèrènt pòìnt ìn thè càll flòw, còvèrìng thè ìnìtìàl ànswèr, à làngùàgè pròmpt, à nèw clìènt grèètìng, àn èxìstìng clìènt grèètìng, ànd thè stàff mènù.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fòrmàts. •••** Èàch grèètìng càn bè tèxt rèndèrèd às spèèch by thè tèlèphòny pròvìdèr, òr à rècòrdèd àùdìò fìlè, ànd àùdìò rècòrdìngs àrè nòt fètchàblè wìthòùt àùthèntìcàtìòn.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** Grèètìng àùdìò ìs stòrèd às plàìntèxt ràthèr thàn èncryptèd, bècàùsè èvèry càllèr hèàrs ìt ànd ìt còntàìns nò prìvàtè ìnfòrmàtìòn. Thìs ìs thè sàmè trèàtmènt thè pròdùct gìvès tò bràndìng ànd òthèr òùtwàrd fàcìng còntènt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Grèètìngs by lìnè. ••••••** Èàch phònè lìnè càn hàvè ìts òwn sèt òf grèètìngs fòr èàch typè.
 ••••••••••••••••••••**Pèrmìssìòns. ••••** Wrìtìng òr ùpdàtìng grèètìngs rèqùìrès thè Wrìtè càll grèètìngs pèrmìssìòn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Greetings are what a caller hears on the way through a phone line, five of them for five points in the call, one for the answer, one for the language prompt,..." |
*
* @param {Demo_Narrative_Admin_Greetings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_greetings_body = /** @type {((inputs?: Demo_Narrative_Admin_Greetings_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Greetings_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_greetings_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_greetings_body(inputs)
	return en_demo_narrative_admin_greetings_body(inputs)
});