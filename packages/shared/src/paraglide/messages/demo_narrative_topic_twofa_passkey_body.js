/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_BodyInputs */

const en_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A passkey makes the device itself the second factor, with no code to read out and nothing in transit that is worth intercepting. [[#keys #privacy]]
**The two forms.** One is a credential held by the device and released by its screen lock, which is a fingerprint, a face or a PIN. The other is a separate physical key that plugs in or is held against the phone. In both cases a private key stays on the device and the server is given only the public half, which cannot produce a signature on its own. [[#keys #encryption]]
**What one sign-in exchanges.** The server issues a single-use challenge and keeps it on the pending session. The device signs the challenge together with the address of the site asking, the server checks the signature, the site address and the identifier of the relying party against what it expected, and then clears the challenge so the same one cannot answer twice. A credential coaxed out on a lookalike domain signs that domain's address and fails the check here. [[#encryption #failure-states]]
**What the server stores for a credential.** The credential identifier, the public key, the authenticator's own use counter, the transports it advertised, whether it is a platform or roaming credential, whether the device reports it as backed up, and the authenticator model identifier. All of it is plaintext, so a database dump shows how many passkeys an account has and roughly what kind of hardware they are. The counter is compared on each use, which is what would expose a cloned authenticator. [[#server-holds #metadata]]
**Where the passkey works.** The relying party is the registrable domain rather than one organization's subdomain, so a passkey works across every organization hosted on it and survives an organization renaming its slug. The tradeoff is that a passkey is not isolated to one organization; the password is, because its salt is looked up per organization. [[#trust-boundary #keys]]
**The verification path.** Challenge issue, assertion checks and counter updates are in \`packages/server/src/auth/two-factor-service.ts\` against the vendored verifier in \`packages/server/src/auth/webauthn/verify.ts\`. The browser side is \`packages/client/src/lib/webauthn.ts\`. The credential row comes from \`packages/server/src/db/migrations/tenant/006_create_webauthn_credentials.ts\`. [[#keys #server-holds]]`)
};

const es_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una passkey convierte el propio dispositivo en el segundo factor, sin ningún código que leer en voz alta y sin nada en tránsito que valga la pena interceptar. [[#keys #privacy]]
**Las dos formas.** Una es una credencial que guarda el dispositivo y que libera su bloqueo de pantalla, ya sea una huella, el rostro o un PIN. La otra es una llave física aparte que se conecta o se acerca al teléfono. En ambos casos una clave privada permanece en el dispositivo y al servidor solo se le entrega la mitad pública, que por sí sola no puede producir una firma. [[#keys #encryption]]
**Lo que intercambia un inicio de sesión.** El servidor emite un desafío de un solo uso y lo guarda en la sesión pendiente. El dispositivo firma el desafío junto con la dirección del sitio que lo pide, el servidor comprueba la firma, la dirección del sitio y el identificador de la parte confiante frente a lo que esperaba, y después borra el desafío para que el mismo no pueda responder dos veces. Una credencial obtenida con engaños en un dominio imitador firma la dirección de ese dominio y no supera la comprobación aquí. [[#encryption #failure-states]]
**Lo que el servidor guarda de una credencial.** El identificador de la credencial, la clave pública, el contador de uso del propio autenticador, los transportes que anunció, si es una credencial de plataforma o itinerante, si el dispositivo la declara respaldada y el identificador del modelo de autenticador. Todo ello en texto plano, así que un volcado de la base de datos muestra cuántas passkeys tiene una cuenta y a grandes rasgos de qué clase de hardware son. El contador se compara en cada uso, que es lo que delataría un autenticador clonado. [[#server-holds #metadata]]
**Dónde funciona la passkey.** La parte confiante es el dominio registrable y no el subdominio de una organización, de modo que una passkey funciona en todas las organizaciones alojadas en él y sobrevive a que una organización cambie su identificador. A cambio, una passkey no queda aislada en una sola organización; la contraseña sí, porque su sal se consulta por organización. [[#trust-boundary #keys]]
**La ruta de verificación.** La emisión del desafío, las comprobaciones de la aserción y la actualización del contador están en \`packages/server/src/auth/two-factor-service.ts\`, contra el verificador incorporado en \`packages/server/src/auth/webauthn/verify.ts\`. El lado del navegador es \`packages/client/src/lib/webauthn.ts\`. La fila de la credencial viene de \`packages/server/src/db/migrations/tenant/006_create_webauthn_credentials.ts\`. [[#keys #server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À pàsskèy tùrns thè dèvìcè ìntò thè sècònd fàctòr. Nò còdè tò typè, nòthìng tò ìntèrcèpt.
Twò fòrms àrè sùppòrtèd: à dèvìcè crèdèntìàl pròtèctèd by thè scrèèn lòck (fìngèrprìnt, fàcè, òr PÌN) ànd à physìcàl sècùrìty kèy. Ìn bòth càsès, thè dèvìcè hòlds à prìvàtè kèy thàt nèvèr lèàvès ìt. Thè sèrvèr stòrès ònly thè pùblìc hàlf ànd cànnòt pròdùcè à vàlìd sìgnàtùrè òn ìts òwn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Àt sìgn-ìn, thè sèrvèr sènds à ònè-tìmè chàllèngè. Thè dèvìcè sìgns ìt, thè sèrvèr vèrìfìès thè sìgnàtùrè, ànd thè chàllèngè ìs dìscàrdèd. Thè sìgnàtùrè ìs bòùnd tò bòth thè chàllèngè ànd thè sìtè's òrìgìn, sò à crèdèntìàl càptùrèd òn à lòòkàlìkè dòmàìn ìs wòrthlèss hèrè. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A passkey makes the device itself the second factor, with no code to read out and nothing in transit that is worth intercepting. [[#keys #privacy]] **The two..." |
*
* @param {Demo_Narrative_Topic_Twofa_Passkey_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_passkey_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_passkey_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_passkey_body(inputs)
	return en_demo_narrative_topic_twofa_passkey_body(inputs)
});