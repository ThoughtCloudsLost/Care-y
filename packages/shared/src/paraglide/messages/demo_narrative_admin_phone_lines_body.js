/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Phone_Lines_BodyInputs */

const en_demo_narrative_admin_phone_lines_body = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An organization's phone lines are the numbers its provider account holds, each one carrying a number and the provider's own id for it. Two purposes can be assigned across them, one line for calls and messages to clients and one for automated system messages, and a single-line organization needs neither assignment. [[#telephony]]
**Which line a call goes out on.** A system message looks for the system line, then the outbound line, then the first provisioned number; an outbound call or text looks for the outbound line, then the first provisioned number. An organization with no provisioned number gets a refusal rather than a call placed from an unexpected number. A call carries the user's own verified callback number, and the server resolves the client's number from the ticket. [The telephony relay](#deep-dive/the-telephony-relay) covers what happens between the two. [[#privacy #failure-states]]
**What the assignment stores.** Two provider ids in plaintext columns on the organization config row. The numbers themselves stay inside the sealed provider configuration, so the tenant database records which line has which job and not what either line is. [The provider connection](#admin-comms/provider) covers that sealed configuration. [[#server-holds #metadata]]
**The resolver and its exclusion rule.** \`createPhoneResolver\` in \`packages/server/src/telephony/phone-resolver.ts\` owns the fallback chain, and \`lookupProvisionedPhones\` in \`config-service.ts\` drops a configured number that carries no provider id rather than substituting the number for the id, which had made an organization with several lines fall through to its first one while a deliberate choice was on file. Greetings are keyed by the number itself, so renumbering a line orphans the greetings recorded for it. [Greetings](#admin-comms/greetings) covers those recordings. [[#failure-states]]`)
};

const es_demo_narrative_admin_phone_lines_body = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las líneas telefónicas de una organización son los números que tiene su cuenta de proveedor, cada uno con un número y el identificador que el proveedor le da. Entre ellas se pueden repartir dos funciones, una línea para llamadas y mensajes a los clientes y otra para los mensajes automáticos del sistema, y una organización con una sola línea no necesita asignar ninguna de las dos. [[#telephony]]
**Por qué línea sale una llamada.** Un mensaje del sistema busca la línea de sistema, luego la línea saliente y luego el primer número aprovisionado; una llamada o un mensaje saliente buscan la línea saliente y luego el primer número aprovisionado. Una organización sin ningún número aprovisionado recibe un rechazo en lugar de una llamada hecha desde un número inesperado. Una llamada lleva el número de devolución verificado de la persona usuaria, y el servidor resuelve el número del cliente a partir del ticket. [El relé de telefonía](#deep-dive/the-telephony-relay) trata lo que ocurre entre los dos. [[#privacy #failure-states]]
**Lo que guarda la asignación.** Dos identificadores de proveedor en columnas en texto plano de la fila de configuración de la organización. Los números en sí se quedan dentro de la configuración sellada del proveedor, así que la base de datos del inquilino registra qué línea tiene qué función y no cuál es cada línea. [La conexión con el proveedor](#admin-comms/provider) trata esa configuración sellada. [[#server-holds #metadata]]
**El resolutor y su regla de exclusión.** \`createPhoneResolver\`, en \`packages/server/src/telephony/phone-resolver.ts\`, tiene la cadena de respaldo, y \`lookupProvisionedPhones\`, en \`config-service.ts\`, descarta un número configurado que no lleve identificador de proveedor en lugar de usar el número como identificador, lo que hacía que una organización con varias líneas cayera en la primera mientras había una elección deliberada guardada. Los saludos se guardan con el número como clave, de modo que renumerar una línea deja huérfanos los saludos grabados para ella. [Saludos](#admin-comms/greetings) trata esas grabaciones. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_phone_lines_body = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch phònè lìnè hàs à nùmbèr, à pùrpòsè ròlè, ànd àssòcìàtèd grèètìngs. Òn à rùnnìng CÀRÈ-Y sèrvèr, phònè lìnès cònnèct tò nùmbèrs pròvìsìònèd thròùgh thè tèlèphòny pròvìdèr, wìth thè òùtbòùnd ròlè hàndlìng càlls thàt ùsèrs ìnìtìàtè ànd thè systèm mèssàgès ròlè hàndlìng àùtòmàtèd nòtìfìcàtìòns. Thè dèmò sèèds twò fìctìònàl 555 nùmbèrs wìth pùrpòsè ròlès ìnstèàd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Phònè lìnè cònfìgùràtìòn rèqùìrès thè Mànàgè ìnfràstrùctùrè pèrmìssìòn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An organization's phone lines are the numbers its provider account holds, each one carrying a number and the provider's own id for it. Two purposes can be as..." |
*
* @param {Demo_Narrative_Admin_Phone_Lines_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_phone_lines_body = /** @type {((inputs?: Demo_Narrative_Admin_Phone_Lines_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Phone_Lines_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_phone_lines_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_phone_lines_body(inputs)
	return en_demo_narrative_admin_phone_lines_body(inputs)
});