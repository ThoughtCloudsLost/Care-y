/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Greetings_BodyInputs */

const en_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each phone line can carry a greeting for each language the organization serves at each point in an inbound call:
- Welcome message plays when a caller first connects.
- Language selection plays when the caller chooses a language.
- First-time caller plays for callers who have never called before.
- Returning caller plays for callers the system recognizes.
- Staff options plays when a user accesses the phone menu.
When a greeting exists for the caller's language, the line plays it; when no greeting exists for the type, the server plays a built-in default message. Greeting text and recordings are plaintext, not encrypted, because the telephony provider must read or play them to callers who have not signed in. A greeting must never contain anything about a client or a case, because the provider and any party on the call can hear it. [[#telephony #server-holds #privacy]]
**Text or recording.** The user writes text for the provider to read aloud, or uploads an audio file in WAV, MP3, or OGG format up to 5 MB. The server checks the file's leading bytes against the expected format before storing it, and rejects a file whose bytes do not match. Uploads are rate-limited per account. [[#failure-states]]
**What does the public address protect?** An audio greeting is served at a public address built from a server-generated key that is not guessable. The address requires no authentication, because the telephony provider fetches it during a live call. Replacing the recording replaces the key, which invalidates the old address. The admin preview fetches the same recording through an authenticated endpoint instead. [[#server-holds #privacy]]
**What does the greeting row reveal?** A dump of this table exposes how many lines the organization operates, which languages it supports, and the full text of every greeting. [The trust boundary](#deep-dive/the-trust-boundary) covers the plaintext columns across the schema. [[#metadata #server-holds]]
**The greeting table and the IVR builder.** Migrations \`019_create_phone_greetings.ts\` and \`054_greeting_phone_number.ts\` define the greeting table. \`packages/server/src/telephony/ivr.ts\` converts each greeting into a spoken line or a played file when a call arrives. Reading and editing greetings both require the Write call greetings permission. [[#permissions]]`)
};

const es_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada línea telefónica puede llevar un saludo para cada idioma que la organización atiende en cada punto de una llamada entrante:
- Mensaje de bienvenida se reproduce cuando quien llama se conecta por primera vez.
- Selección de idioma se reproduce cuando quien llama elige un idioma.
- Primera llamada se reproduce para personas que nunca han llamado antes.
- Llamada recurrente se reproduce para personas que el sistema reconoce.
- Opciones del personal se reproduce cuando la persona usuaria accede al menú telefónico.
Cuando existe un saludo en el idioma de quien llama, la línea lo reproduce; cuando no existe saludo para el tipo, el servidor reproduce un mensaje predeterminado integrado. El texto y las grabaciones de los saludos se almacenan en texto plano, sin cifrar, porque el proveedor de telefonía debe leerlos o reproducirlos para personas que no han iniciado sesión. Un saludo nunca debe contener nada sobre un cliente o un caso, porque el proveedor y cualquier participante de la llamada pueden escucharlo. [[#telephony #server-holds #privacy]]
**Texto o grabación.** La persona usuaria escribe texto para que el proveedor lo lea en voz alta, o sube un archivo de audio en formato WAV, MP3 u OGG de hasta 5 MB. El servidor verifica los bytes iniciales del archivo contra el formato esperado antes de almacenarlo, y rechaza un archivo cuyos bytes no coinciden. Las subidas tienen límite de frecuencia por cuenta. [[#failure-states]]
**¿Qué protege la dirección pública?** Un saludo de audio se sirve en una dirección pública construida a partir de una clave generada por el servidor que no es adivinable. La dirección no requiere autenticación, porque el proveedor de telefonía la solicita durante una llamada en curso. Reemplazar la grabación reemplaza la clave, lo que invalida la dirección anterior. La vista previa del administrador obtiene la misma grabación a través de un punto autenticado. [[#server-holds #privacy]]
**¿Qué revela la fila de saludo?** Un volcado de esta tabla expone cuántas líneas opera la organización, qué idiomas atiende y el texto completo de cada saludo. [La frontera de confianza](#deep-dive/the-trust-boundary) trata las columnas en texto plano del esquema. [[#metadata #server-holds]]
**La tabla de saludos y el constructor IVR.** Las migraciones \`019_create_phone_greetings.ts\` y \`054_greeting_phone_number.ts\` definen la tabla de saludos. \`packages/server/src/telephony/ivr.ts\` convierte cada saludo en una línea hablada o un archivo reproducido cuando llega una llamada. Leer y editar saludos requiere el permiso Escribir saludos de llamada. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch phònè lìnè càn càrry à grèètìng fòr èàch làngùàgè thè òrgànìzàtìòn sèrvès àt èàch pòìnt ìn àn ìnbòùnd càll:
- Wèlcòmè mèssàgè plàys whèn à càllèr fìrst cònnècts.
- Làngùàgè sèlèctìòn plàys whèn thè càllèr chòòsès à làngùàgè.
- Fìrst-tìmè càllèr plàys fòr càllèrs whò hàvè nèvèr càllèd bèfòrè.
- Rètùrnìng càllèr plàys fòr càllèrs thè systèm rècògnìzès.
- Stàff òptìòns plàys whèn à ùsèr àccèssès thè phònè mènù.
Whèn à grèètìng èxìsts fòr thè càllèr's làngùàgè, thè lìnè plàys ìt; whèn nò grèètìng èxìsts fòr thè typè, thè sèrvèr plàys à bùìlt-ìn dèfàùlt mèssàgè. Grèètìng tèxt ànd rècòrdìngs àrè plàìntèxt, nòt èncryptèd, bècàùsè thè tèlèphòny pròvìdèr mùst rèàd òr plày thèm tò càllèrs whò hàvè nòt sìgnèd ìn. À grèètìng mùst nèvèr còntàìn ànythìng àbòùt à clìènt òr à càsè, bècàùsè thè pròvìdèr ànd àny pàrty òn thè càll càn hèàr ìt. [[#tèlèphòny #sèrvèr-hòlds #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Tèxt òr rècòrdìng. ••••••** Thè ùsèr wrìtès tèxt fòr thè pròvìdèr tò rèàd àlòùd, òr ùplòàds àn àùdìò fìlè ìn WÀV, MP3, òr ÒGG fòrmàt ùp tò 5 MB. Thè sèrvèr chècks thè fìlè's lèàdìng bytès àgàìnst thè èxpèctèd fòrmàt bèfòrè stòrìng ìt, ànd rèjècts à fìlè whòsè bytès dò nòt màtch. Ùplòàds àrè ràtè-lìmìtèd pèr àccòùnt. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè pùblìc àddrèss pròtèct? ••••••••••••** Àn àùdìò grèètìng ìs sèrvèd àt à pùblìc àddrèss bùìlt fròm à sèrvèr-gènèràtèd kèy thàt ìs nòt gùèssàblè. Thè àddrèss rèqùìrès nò àùthèntìcàtìòn, bècàùsè thè tèlèphòny pròvìdèr fètchès ìt dùrìng à lìvè càll. Rèplàcìng thè rècòrdìng rèplàcès thè kèy, whìch ìnvàlìdàtès thè òld àddrèss. Thè àdmìn prèvìèw fètchès thè sàmè rècòrdìng thròùgh àn àùthèntìcàtèd èndpòìnt ìnstèàd. [[#sèrvèr-hòlds #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè grèètìng ròw rèvèàl? •••••••••••** À dùmp òf thìs tàblè èxpòsès hòw màny lìnès thè òrgànìzàtìòn òpèràtès, whìch làngùàgès ìt sùppòrts, ànd thè fùll tèxt òf èvèry grèètìng. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thè plàìntèxt còlùmns àcròss thè schèmà. [[#mètàdàtà #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè grèètìng tàblè ànd thè ÌVR bùìldèr. ••••••••••••** Mìgràtìòns \`019_crèàtè_phònè_grèètìngs.ts\` ànd \`054_grèètìng_phònè_nùmbèr.ts\` dèfìnè thè grèètìng tàblè. \`pàckàgès/sèrvèr/src/tèlèphòny/ìvr.ts\` cònvèrts èàch grèètìng ìntò à spòkèn lìnè òr à plàyèd fìlè whèn à càll àrrìvès. Rèàdìng ànd èdìtìng grèètìngs bòth rèqùìrè thè Wrìtè càll grèètìngs pèrmìssìòn. [[#pèrmìssìòns]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each phone line can carry a greeting for each language the organization serves at each point in an inbound call: - Welcome message plays when a caller first ..." |
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