/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Sms_Templates_BodyInputs */

const en_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An SMS template is the wording of an automatic reply, written once for each language an organization serves. Two templates exist, the reply to a first message from an unknown number and the reply to a message the system could not handle. [[#telephony]]
**When the reply goes out and in which language.** An inbound text draws the first-message template in the language stored for the number it came from, and falls back to the organization's default language and then to a built-in English sentence when no template is written for either. The reply leaves on the organization's own line, so a client who answers it reaches the same place. [[#failure-states]]
**Length.** Template text is capped at 1600 characters, which is ten standard message segments, and the server refuses a longer save rather than truncating it. Providers bill and split by segment, so wording that runs long arrives as several messages on the client's device. [[#failure-states]]
**What the template row holds.** The wording, the language and the template type in plaintext, with no client and no ticket attached, since a template is the organization's own words and not case content. A database dump gives the languages an organization serves and what it says to a stranger. The message sent from a template becomes an encrypted follow-up on the ticket like any other. [[#server-holds #privacy]]
**The auto-reply path.** \`selectAutoReply\` in \`packages/server/src/telephony/sms-auto-reply.ts\` runs the language fallback and \`packages/server/src/telephony/inbound-sms.ts\` sends the result after the inbound message has been stored. The row is \`020_create_sms_responses.ts\`, unique on language and type. Editing needs permission to write automatic replies, and reaching the section needs permission to manage infrastructure. [[#permissions]]`)
};

const es_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una plantilla SMS es la redacción de una respuesta automática, escrita una vez para cada idioma que atiende la organización. Existen dos plantillas, la respuesta al primer mensaje de un número desconocido y la respuesta a un mensaje que el sistema no pudo procesar. [[#telephony]]
**Cuándo sale la respuesta y en qué idioma.** Un mensaje entrante toma la plantilla de primer mensaje en el idioma guardado para el número del que viene, y recae en el idioma por defecto de la organización y después en una frase integrada en inglés cuando no hay plantilla escrita para ninguno de los dos. La respuesta sale por la línea propia de la organización, así que quien la conteste llega al mismo sitio. [[#failure-states]]
**Longitud.** El texto de la plantilla tiene un tope de 1600 caracteres, que son diez segmentos de mensaje estándar, y el servidor rechaza un guardado más largo en lugar de recortarlo. Los proveedores facturan y dividen por segmentos, así que una redacción larga llega como varios mensajes al dispositivo del cliente. [[#failure-states]]
**Lo que guarda la fila de una plantilla.** La redacción, el idioma y el tipo de plantilla en texto plano, sin ningún cliente ni ningún ticket asociado, porque una plantilla son las palabras de la organización y no contenido de un caso. Un volcado de la base de datos da los idiomas que atiende una organización y lo que le dice a una persona desconocida. El mensaje enviado desde una plantilla queda como un seguimiento cifrado en el ticket, igual que cualquier otro. [[#server-holds #privacy]]
**La ruta de la respuesta automática.** \`selectAutoReply\`, en \`packages/server/src/telephony/sms-auto-reply.ts\`, aplica la cadena de idiomas y \`packages/server/src/telephony/inbound-sms.ts\` envía el resultado después de guardar el mensaje entrante. La fila es \`020_create_sms_responses.ts\`, única por idioma y tipo. Editar requiere permiso para escribir respuestas automáticas, y llegar a la sección requiere permiso para gestionar la infraestructura. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_sms_templates_body = /** @type {(inputs: Demo_Narrative_Admin_Sms_Templates_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS tèmplàtès dèfìnè thè àùtòmàtèd mèssàgès thè systèm sènds tò clìènts, ànd tèmplàtès sùppòrt mùltìplè làngùàgès sò thè systèm càn sènd mèssàgès ìn thè clìènt's prèfèrrèd làngùàgè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Mèssàgè lèngth. •••••** Tèmplàtè tèxt ìs càppèd àt 1600 chàràctèrs, whìch ìs tèn stàndàrd SMS sègmènts, ànd thè sèrvèr rèjècts à sàvè thàt èxcèèds thè lìmìt.
 •••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Èdìtìng SMS tèmplàtès rèqùìrès thè Wrìtè àùtòmàtìc rèplìès pèrmìssìòn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An SMS template is the wording of an automatic reply, written once for each language an organization serves. Two templates exist, the reply to a first messag..." |
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