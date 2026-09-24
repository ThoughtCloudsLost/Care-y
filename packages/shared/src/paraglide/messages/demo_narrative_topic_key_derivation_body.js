/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_BodyInputs */

const en_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The password is the starting point, but it is not the key. The browser runs an Argon2id derivation (tuned to use 64 MB of memory across four passes) to transform the password into raw key material. This derivation happens entirely in the browser, and the server never sees its input or output.
**How it works.** The derived material then passes through a threshold protocol involving two servers located in separate legal jurisdictions. The browser blinds its input before sending it, and unblinds the result after both servers respond. Neither server sees the password, the derived key, or what the other server contributed. Each server holds one share, and a single share is mathematically useless on its own.
**Encryption.** The combined output produces a personal keypair and the key that unwraps the organization's shared encryption key. Only after this process completes can the browser decrypt case data.
**Privacy.** This design means that compromising one server, or compelling disclosure in one jurisdiction, yields nothing. An attacker would need both servers, access in both legal jurisdictions, the password, and the second factor. Shares are refreshed daily, so a captured share expires even if never detected.`)
};

const es_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La contraseña es el punto de partida, pero no es la clave. El navegador ejecuta una derivación Argon2id (configurada para usar 64 MB de memoria en cuatro pasadas) para transformar la contraseña en material criptográfico. Esta derivación ocurre enteramente en el navegador, y el servidor nunca ve su entrada ni su salida.
**Cómo funciona.** El material derivado pasa luego por un protocolo de umbral que involucra dos servidores ubicados en jurisdicciones legales separadas. El navegador ciega su entrada antes de enviarla y desciega el resultado tras la respuesta de ambos servidores. Ningún servidor ve la contraseña, la clave derivada ni lo que contribuyó el otro servidor. Cada servidor posee una parte, y una sola parte es matemáticamente inútil por sí misma.
**Cifrado.** La salida combinada produce el par de claves personal y la clave que desenvuelve la clave de cifrado compartida de la organización. Solo tras completar este proceso puede el navegador descifrar los datos de los casos.
**Privacidad.** Este diseño significa que comprometer un servidor, u obligar a revelar información en una jurisdicción, no produce nada. Un atacante necesitaría ambos servidores, acceso en ambas jurisdicciones legales, la contraseña y el segundo factor. Las partes se renuevan diariamente, de modo que una parte capturada caduca aunque nunca se detecte.`)
};

const en_xa2_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pàsswòrd ìs thè stàrtìng pòìnt, bùt ìt ìs nòt thè kèy. Thè bròwsèr rùns àn Àrgòn2ìd dèrìvàtìòn (tùnèd tò ùsè 64 MB òf mèmòry àcròss fòùr pàssès) tò trànsfòrm thè pàsswòrd ìntò ràw kèy màtèrìàl. Thìs dèrìvàtìòn hàppèns èntìrèly ìn thè bròwsèr, ànd thè sèrvèr nèvèr sèès ìts ìnpùt òr òùtpùt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè dèrìvèd màtèrìàl thèn pàssès thròùgh à thrèshòld pròtòcòl ìnvòlvìng twò sèrvèrs lòcàtèd ìn sèpàràtè lègàl jùrìsdìctìòns. Thè bròwsèr blìnds ìts ìnpùt bèfòrè sèndìng ìt, ànd ùnblìnds thè rèsùlt àftèr bòth sèrvèrs rèspònd. Nèìthèr sèrvèr sèès thè pàsswòrd, thè dèrìvèd kèy, òr whàt thè òthèr sèrvèr còntrìbùtèd. Èàch sèrvèr hòlds ònè shàrè, ànd à sìnglè shàrè ìs màthèmàtìcàlly ùsèlèss òn ìts òwn.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè còmbìnèd òùtpùt pròdùcès à pèrsònàl kèypàìr ànd thè kèy thàt ùnwràps thè òrgànìzàtìòn's shàrèd èncryptìòn kèy. Ònly àftèr thìs pròcèss còmplètès càn thè bròwsèr dècrypt càsè dàtà.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Prìvàcy. •••** Thìs dèsìgn mèàns thàt còmpròmìsìng ònè sèrvèr, òr còmpèllìng dìsclòsùrè ìn ònè jùrìsdìctìòn, yìèlds nòthìng. Àn àttàckèr wòùld nèèd bòth sèrvèrs, àccèss ìn bòth lègàl jùrìsdìctìòns, thè pàsswòrd, ànd thè sècònd fàctòr. Shàrès àrè rèfrèshèd dàìly, sò à càptùrèd shàrè èxpìrès èvèn ìf nèvèr dètèctèd. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The password is the starting point, but it is not the key. The browser runs an Argon2id derivation (tuned to use 64 MB of memory across four passes) to trans..." |
*
* @param {Demo_Narrative_Topic_Key_Derivation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_key_derivation_body = /** @type {((inputs?: Demo_Narrative_Topic_Key_Derivation_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Key_Derivation_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_key_derivation_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_key_derivation_body(inputs)
	return en_demo_narrative_topic_key_derivation_body(inputs)
});