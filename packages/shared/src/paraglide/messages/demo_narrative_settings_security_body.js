/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Security_BodyInputs */

const en_demo_narrative_settings_security_body = /** @type {(inputs: Demo_Narrative_Settings_Security_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The security briefing shown once during onboarding can be reopened at any time, and reopening it records nothing: the flag that remembers whether an account has seen it is written on the onboarding path alone. [[#privacy #server-holds]]
**What the briefing sets out.** For each category of data the system holds, it names what is stored, who has access to it, and what a compromise of that store would reveal. The categories are client data, organization data, branding, volunteer records, usernames, notification email and telephony, which are the seven places the protection differs. [The trust boundary](#deep-dive/the-trust-boundary) covers the same line in more detail. [[#trust-boundary #server-holds]]
**The scenarios it answers.** Server seizure, compromise of the key-derivation servers, a lost or seized device, an insider with administrative access, the telephony provider, and a network observer. Each one is answered with what that adversary gets and what remains out of reach, rather than with a claim that it cannot happen. [[#trust-boundary #failure-states]]
**Why it is worth rereading.** The choices it explains carry costs that outlast the reading: there is no password reset, text messages leave the encryption boundary, and an organization that loses every account holding the organization key loses the data wrapped under it. An account taking over a role months after onboarding has the same reasons to read it as one being set up. [[#keys #failure-states]]
**What is in development.** Replaying the interactive walkthrough is not built, and asking for it reports that. [[#failure-states]]
**Where the briefing lives.** The content is \`packages/client/src/lib/components/onboarding/SecurityBriefing.svelte\`, reopened from settings through \`SecurityBriefingPopup.svelte\` in \`packages/client/src/lib/components/settings/\`, and the onboarding flag is \`users.has_seen_briefing\` from \`packages/server/src/db/migrations/tenant/076_add_has_seen_briefing.ts\`, written by \`profile.markBriefingSeen\`. [[#server-holds]]`)
};

const es_demo_narrative_settings_security_body = /** @type {(inputs: Demo_Narrative_Settings_Security_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El informe de seguridad que se muestra una vez durante la incorporación se puede volver a abrir en cualquier momento, y volver a abrirlo no registra nada: la marca que recuerda si una cuenta lo ha visto se escribe únicamente en la ruta de incorporación. [[#privacy #server-holds]]
**Lo que expone el informe.** Para cada categoría de datos que el sistema guarda, nombra qué se almacena, quién tiene acceso y qué revelaría un compromiso de ese almacén. Las categorías son los datos del cliente, los datos de la organización, la identidad visual, los registros de las personas voluntarias, los nombres de usuario, el correo de notificación y la telefonía, que son los siete sitios donde la protección cambia. [La frontera de confianza](#deep-dive/the-trust-boundary) trata esa misma línea con más detalle. [[#trust-boundary #server-holds]]
**Los escenarios que responde.** La incautación del servidor, el compromiso de los servidores de derivación de claves, un dispositivo perdido o incautado, una persona con acceso administrativo desde dentro, el proveedor de telefonía y quien observe la red. Cada uno se responde con lo que ese adversario obtiene y lo que queda fuera de su alcance, y no con la afirmación de que no puede ocurrir. [[#trust-boundary #failure-states]]
**Por qué conviene releerlo.** Las decisiones que explica tienen costes que duran más que la lectura: no hay restablecimiento de contraseña, los mensajes de texto salen de la frontera de cifrado y una organización que pierde todas las cuentas que tienen la clave de la organización pierde los datos envueltos con ella. Una cuenta que asume un puesto meses después de la incorporación tiene los mismos motivos para leerlo que una que se está configurando. [[#keys #failure-states]]
**Lo que está en desarrollo.** Volver a reproducir el recorrido guiado no está construido, y pedirlo lo indica. [[#failure-states]]
**Dónde vive el informe.** El contenido es \`packages/client/src/lib/components/onboarding/SecurityBriefing.svelte\`, reabierto desde los ajustes mediante \`SecurityBriefingPopup.svelte\`, en \`packages/client/src/lib/components/settings/\`, y la marca de incorporación es \`users.has_seen_briefing\`, de \`packages/server/src/db/migrations/tenant/076_add_has_seen_briefing.ts\`, escrita por \`profile.markBriefingSeen\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_settings_security_body = /** @type {(inputs: Demo_Narrative_Settings_Security_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Twò èntrìès sìt ùndèr thè sècùrìty hèàdìng bèsìdè twò fàctòr ènròllmènt.
 ••••••••••••••••••••••**Rèvìèw sècùrìty brìèfìng ••••••••** òpèns thè brìèfìng fròm thè lògìn wàlkthròùgh. Ìt èxplàìns whàt CÀRÈ-Y pròtècts, hòw thè èncryptìòn wòrks àt à hìgh lèvèl, ànd whàt rìsks rèmàìn òùtsìdè thè systèm's còntròl.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèvìèw sècùrìty wàlkthròùgh •••••••••** wìll rèplày thè ìntèràctìvè wàlkthròùgh ìtsèlf ànd ìs nòt àvàìlàblè yèt. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The security briefing shown once during onboarding can be reopened at any time, and reopening it records nothing: the flag that remembers whether an account ..." |
*
* @param {Demo_Narrative_Settings_Security_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_security_body = /** @type {((inputs?: Demo_Narrative_Settings_Security_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Security_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_security_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_security_body(inputs)
	return en_demo_narrative_settings_security_body(inputs)
});