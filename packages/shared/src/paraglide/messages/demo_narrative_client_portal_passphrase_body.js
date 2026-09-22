/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Passphrase_BodyInputs */

const en_demo_narrative_client_portal_passphrase_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A link created with a passphrase asks for the five spoken words before any message is decrypted, and the organization holds no copy of them to lose or hand over. [[#portal #keys]]
**Why a guess costs a round trip.** The browser stretches the normalized passphrase with Argon2id, folds the result together with the credential from the link, and sends a blinded value to be evaluated under a tag naming that organization and that channel. Only the evaluated answer derives the channel keypair, so a guess cannot be tested on the device holding the link, and each attempt is a rate-limited request that can be refused. Revoking the channel retires the tag, after which no evaluation for it is answered at all. [How keys are derived](#deep-dive/how-keys-are-derived) covers the evaluation and the two holders that answer it. [[#keys #encryption]]
**How a wrong passphrase is recognized.** The channel row carries a small ciphertext sealed to the correct public key, and the browser tells a right passphrase from a wrong one by opening it locally. The server is told nothing about the outcome, so it cannot learn which guesses were close or which link someone is working on. [[#server-holds #privacy]]
**Typing the words back differently.** Capitalization, spacing and unicode form are normalized before the stretch, so words heard on a call and typed back with capitals, double spaces or an accented keyboard derive the same key. Word identity and word order are the only things that have to match. [[#failure-states #keys]]
**What the wait during entry is.** Argon2id is deliberately expensive, and the evaluation is a network round trip that may also carry a proof-of-work puzzle the browser solves first, so entry takes seconds by design rather than by accident. [[#keys #failure-states]]
**Where the gate runs.** The gate is \`PortalPassphraseGate.svelte\` in \`packages/client/src/lib/portal/\`, the stretch and the fold are \`stretchPassphrase\` and \`portalOprfInput\` in \`packages/crypto/src/portal.ts\`, and the key check comes back on the bootstrap response from \`packages/server/src/portal/portal-message-service.ts\`. The words themselves are drawn on the organization's side, which [Setting up a secure link](#ticket-detail/secure-link) covers. [[#keys #portal]]`)
};

const es_demo_narrative_client_portal_passphrase_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un enlace creado con frase de paso pide las cinco palabras habladas antes de descifrar ningún mensaje, y la organización no guarda ninguna copia de ellas que pueda perder o entregar. [[#portal #keys]]
**Por qué cada intento cuesta una ida y vuelta.** El navegador estira con Argon2id la frase de paso normalizada, une el resultado con la credencial del enlace y envía un valor cegado para que se evalúe bajo una etiqueta que nombra a esa organización y a ese canal. Solo la respuesta evaluada deriva el par de claves del canal, así que un intento no se puede probar en el dispositivo que tiene el enlace, y cada uno es una solicitud limitada que se puede rechazar. Revocar el canal retira la etiqueta, y a partir de ahí no se responde ninguna evaluación para ella. [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) trata la evaluación y los dos titulares que la responden. [[#keys #encryption]]
**Cómo se reconoce una frase de paso incorrecta.** La fila del canal lleva un pequeño texto cifrado sellado con la clave pública correcta, y el navegador distingue una frase de paso correcta de una incorrecta abriéndolo de forma local. Al servidor no se le comunica el resultado, así que no puede saber qué intentos estuvieron cerca ni sobre qué enlace está trabajando alguien. [[#server-holds #privacy]]
**Escribir las palabras de otra manera.** Las mayúsculas, los espacios y la forma unicode se normalizan antes del estirado, de modo que unas palabras oídas en una llamada y escritas con mayúsculas, espacios dobles o un teclado con acentos derivan la misma clave. La identidad y el orden de las palabras son lo único que tiene que coincidir. [[#failure-states #keys]]
**Qué es la espera durante la entrada.** Argon2id es costoso a propósito, y la evaluación es una ida y vuelta por red que además puede traer un problema de prueba de trabajo que el navegador resuelve antes, así que la entrada tarda varios segundos por diseño y no por accidente. [[#keys #failure-states]]
**Dónde se ejecuta la puerta de entrada.** La puerta es \`PortalPassphraseGate.svelte\`, en \`packages/client/src/lib/portal/\`; el estirado y la unión son \`stretchPassphrase\` y \`portalOprfInput\`, en \`packages/crypto/src/portal.ts\`; y la comprobación de clave llega en la respuesta de arranque desde \`packages/server/src/portal/portal-message-service.ts\`. Las palabras se sortean en el lado de la organización, que trata [Crear un enlace seguro](#ticket-detail/secure-link). [[#keys #portal]]`)
};

const en_xa2_demo_narrative_client_portal_passphrase_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à sècùrè lìnk wàs crèàtèd wìth à pàssphràsè, thè pòrtàl pàgè shòws à pàssphràsè fòrm bèfòrè thè thrèàd, ànd thè vìsìtòr èntèrs thè fìvè wòrd pàssphràsè thèy rècèìvèd òn à vèrìfìcàtìòn càll.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè bròwsèr dèrìvès èncryptìòn kèys fròm thè pàssphràsè thròùgh à dèlìbèràtèly slòw pròcèss thàt còmbìnès lòcàl còmpùtàtìòn wìth à sèrvèr ròùnd trìp, ànd à prògrèss ìndìcàtòr àppèàrs dùrìng èàch stèp bècàùsè thè còst ìs thè dèfènsè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìf ìt fàìls. ••••** Ìf thè pàssphràsè ìs wròng thè pàgè shòws àn èrròr ànd thè vìsìtòr càn try àgàìn, bùt èvèry àttèmpt mùst pàss thròùgh thè sàmè sèrvèr ròùnd trìp sò sòmèònè whò hàs thè lìnk àlònè cànnòt tèst gùèssès òn thèìr òwn dèvìcè. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A link created with a passphrase asks for the five spoken words before any message is decrypted, and the organization holds no copy of them to lose or hand o..." |
*
* @param {Demo_Narrative_Client_Portal_Passphrase_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_passphrase_body = /** @type {((inputs?: Demo_Narrative_Client_Portal_Passphrase_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Passphrase_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_passphrase_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_portal_passphrase_body(inputs)
	return en_demo_narrative_client_portal_passphrase_body(inputs)
});