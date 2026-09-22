/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Notifications_BodyInputs */

const en_demo_narrative_settings_notifications_body = /** @type {(inputs: Demo_Narrative_Settings_Notifications_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A switch for each pairing of an event and a delivery channel decides what reaches the user and how, across nine events and three channels. An account with nothing stored has every one of them on, and a switch written for one account changes nothing for anyone else. [[#privacy #client-data]]
**The channel that does not take a switch.** Push, email and text message are the three that do. The in-app feed is delivered to every recipient of an event whether or not anything else is, so it is never stored as a preference, and an account that has turned off every channel still sees the event when the app is open. [[#failure-states #client-data]]
**Narrowing a setting to one queue.** A queue override applies to events in that queue and takes priority over the matching global switch, and a per-case override takes priority over both. Writing a case override requires the account to hold that case's key, and a case it cannot read and a case that does not exist are refused in the same words, so the refusal is not a way to learn which. [The permission system](#deep-dive/the-permission-system) covers where that access comes from. [[#permissions #metadata]]
**Two places a preference does not hold.** When the preference lookup fails, the dispatch treats every channel as allowed, on the judgment that a missed escalation costs more than an unwanted email. When an account has asked for text messages and has no verified number to reach, it is moved onto the email list for that event even if email is switched off. Preferences are also read when a notification is queued rather than when it is sent, so a retried delivery goes to the set resolved at the start. [[#failure-states #telephony]]
**What a notification carries.** An email names the kind of event and links to the sign-in page, with no case title, no client alias and no message text, and it is composed in English whatever language the account has stored. The mail provider therefore learns an address, a time and a subject line naming the kind of event. [[#server-holds #privacy]]
**What the preference rows reveal.** Each row is the account, the scope, the event type, the channel and the flag, all in plaintext. A database dump shows which queues an account set overrides on and which events it silenced, which is a map of what that account watches, held beside data that says nothing about the cases themselves. [The trust boundary](#deep-dive/the-trust-boundary) covers the rest of the plaintext schema. [[#metadata #server-holds]]
**The cascade and the dispatch.** Resolution and the reset are \`packages/server/src/notifications/preferences.ts\`, the table is \`packages/server/src/db/migrations/tenant/084_create_notification_preferences.ts\`, and the fan-out that consumes the allow lists is \`packages/server/src/notifications/service.ts\`. Email goes to \`users.encrypted_notification_addr\`, which is also the address email second-factor codes are sent to. [Two factor enrollment](#settings/two-factor) covers how that address gets written. [[#server-holds]]`)
};

const es_demo_narrative_settings_notifications_body = /** @type {(inputs: Demo_Narrative_Settings_Notifications_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un interruptor por cada combinación de un evento y un canal de entrega decide qué llega a la persona usuaria y cómo, entre nueve eventos y tres canales. Una cuenta sin nada guardado los tiene todos activados, y un interruptor escrito para una cuenta no cambia nada para las demás. [[#privacy #client-data]]
**El canal que no admite interruptor.** El push, el correo y el mensaje de texto son los tres que sí. El flujo dentro de la aplicación se entrega a todas las personas destinatarias de un evento se entregue o no cualquier otra cosa, así que nunca se guarda como preferencia, y una cuenta que haya apagado todos los canales sigue viendo el evento con la aplicación abierta. [[#failure-states #client-data]]
**Ajustar una preferencia a una sola cola.** Una excepción de cola se aplica a los eventos de esa cola y tiene prioridad sobre el interruptor global correspondiente, y una excepción por caso tiene prioridad sobre las dos. Escribir una excepción por caso exige que la cuenta tenga la clave de ese caso, y un caso que no puede leer y un caso que no existe se rechazan con las mismas palabras, de modo que el rechazo no sirve para averiguar cuál es cuál. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde viene ese acceso. [[#permissions #metadata]]
**Dos sitios donde una preferencia no se aplica.** Cuando falla la consulta de preferencias, el envío trata todos los canales como permitidos, por el criterio de que una escalada perdida cuesta más que un correo no deseado. Cuando una cuenta ha pedido mensajes de texto y no hay ningún número verificado al que llegar, pasa a la lista de correo para ese evento aunque el correo esté apagado. Las preferencias además se leen cuando la notificación se encola y no cuando se envía, así que un reintento va al conjunto resuelto al principio. [[#failure-states #telephony]]
**Lo que lleva una notificación.** Un correo nombra la clase de evento y enlaza a la página de inicio de sesión, sin título del caso, sin alias del cliente y sin texto de los mensajes, y se redacta en inglés sea cual sea el idioma guardado en la cuenta. El proveedor de correo, por tanto, conoce una dirección, una hora y un asunto que nombra la clase de evento. [[#server-holds #privacy]]
**Lo que revelan las filas de preferencias.** Cada fila es la cuenta, el ámbito, el tipo de evento, el canal y la marca, todo en texto plano. Un volcado de la base de datos muestra en qué colas fijó excepciones una cuenta y qué eventos silenció, que es un mapa de lo que esa cuenta vigila, guardado junto a datos que no dicen nada de los casos en sí. [La frontera de confianza](#deep-dive/the-trust-boundary) trata el resto del esquema en texto plano. [[#metadata #server-holds]]
**La cascada y el envío.** La resolución y el restablecimiento están en \`packages/server/src/notifications/preferences.ts\`, la tabla es \`packages/server/src/db/migrations/tenant/084_create_notification_preferences.ts\`, y el reparto que consume las listas de permitidos es \`packages/server/src/notifications/service.ts\`. El correo va a \`users.encrypted_notification_addr\`, que es también la dirección a la que se envían los códigos de segundo factor por correo. [Inscripción de doble factor](#settings/two-factor) trata cómo se escribe esa dirección. [[#server-holds]]`)
};

const en_xa2_demo_narrative_settings_notifications_body = /** @type {(inputs: Demo_Narrative_Settings_Notifications_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè nòtìfìcàtìòn prèfèrèncès lèt thè ùsèr còntròl whìch èvènts pròdùcè nòtìfìcàtìòns ànd thròùgh whìch chànnèls, wìth èàch còmbìnàtìòn tògglèd ìndèpèndèntly ànd chàngès tàkìng èffèct ìmmèdìàtèly wìthòùt àffèctìng òthèr ùsèrs.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Qùèùè òvèrrìdès. •••••** À còllàpsìblè sèctìòn pèr qùèùè lèts thè ùsèr òvèrrìdè thè glòbàl sèttìng fòr spècìfìc qùèùès, ànd à qùèùè òvèrrìdè tàkès prìòrìty òvèr thè màtchìng glòbàl prèfèrèncè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••**Rèsèt. ••** À rèsèt bùttòn dèlètès àll cùstòm prèfèrèncès àftèr à cònfìrmàtìòn dìàlòg, whìch rètùrns èvèry nòtìfìcàtìòn tò ìts ènàblèd dèfàùlt.
 ••••••••••••••••••••••••••••••••••••••••**Dèfàùlts. •••** Nèw ùsèrs hàvè nò stòrèd prèfèrèncès, sò èvèry nòtìfìcàtìòn stàrts ènàblèd ùntìl thèy chàngè ìt. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A switch for each pairing of an event and a delivery channel decides what reaches the user and how, across nine events and three channels. An account with no..." |
*
* @param {Demo_Narrative_Settings_Notifications_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_notifications_body = /** @type {((inputs?: Demo_Narrative_Settings_Notifications_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Notifications_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_notifications_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_notifications_body(inputs)
	return en_demo_narrative_settings_notifications_body(inputs)
});