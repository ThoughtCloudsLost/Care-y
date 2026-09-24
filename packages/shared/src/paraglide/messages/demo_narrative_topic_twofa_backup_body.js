/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enrolling a first second-factor method also produces eight backup codes, each of which completes one sign-in and then stops working. They exist for the sign-in where the usual method is out of reach, which includes a lost phone, a flat battery and a security key left at home. [[#failure-states #privacy]]
**What the server stores for a backup code.** A scrypt hash, in the same shape used for password and one-time codes. The codes are shown once at the moment they are generated and there is no route that returns them afterward, so a set that was not written down is replaced rather than recovered. Generating a new set deletes the previous one in the same operation. [[#server-holds #failure-states]]
**Where to keep them.** Somewhere away from the device used to sign in, because a code sitting beside the password on the same phone turns two factors back into one. Paper in a different physical place, or a password manager that is not unlocked by the same device lock, both work. [[#privacy]]
**What they cannot do.** A backup code satisfies the second factor and nothing else. It does not stand in for the password, and it plays no part in deriving encryption keys, so a code alone opens nothing. [[#keys #trust-boundary]]
**The generator and its row.** Generation, formatting, normalization and verification are in \`packages/server/src/auth/backup-codes.ts\`, and the row is \`packages/server/src/db/migrations/tenant/009_create_backup_codes.ts\`. [[#server-holds]]`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inscribir el primer método de segundo factor produce además ocho códigos de respaldo, cada uno de los cuales completa un inicio de sesión y después deja de funcionar. Existen para el inicio de sesión en el que el método habitual queda fuera de alcance, ya sea por un teléfono perdido, una batería agotada o una llave de seguridad olvidada en casa. [[#failure-states #privacy]]
**Lo que el servidor guarda de un código de respaldo.** Un hash scrypt, con la misma forma que se usa para las contraseñas y los códigos de un solo uso. Los códigos se muestran una sola vez en el momento de generarlos y no hay ninguna vía que los devuelva después, de modo que un conjunto que no se anotó se sustituye en lugar de recuperarse. Generar un conjunto nuevo elimina el anterior en la misma operación. [[#server-holds #failure-states]]
**Dónde guardarlos.** En un sitio alejado del dispositivo con el que se inicia sesión, porque un código guardado junto a la contraseña en el mismo teléfono convierte otra vez dos factores en uno. Sirven tanto el papel en un lugar físico distinto como un gestor de contraseñas que no se abra con el mismo bloqueo del dispositivo. [[#privacy]]
**Lo que no pueden hacer.** Un código de respaldo satisface el segundo factor y nada más. No sustituye a la contraseña y no interviene en la derivación de las claves de cifrado, así que un código por sí solo no abre nada. [[#keys #trust-boundary]]
**El generador y su fila.** La generación, el formato, la normalización y la verificación están en \`packages/server/src/auth/backup-codes.ts\`, y la fila es \`packages/server/src/db/migrations/tenant/009_create_backup_codes.ts\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àt fìrst ènròllmènt òf àny sècònd-fàctòr mèthòd, thè systèm gènèràtès èìght ònè-tìmè bàckùp còdès. Èàch còdè wòrks èxàctly òncè.
 •••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè sèrvèr stòrès ònly hàshès òf thèsè còdès. Thèy àrè dìsplàyèd òncè àt gènèràtìòn ànd cànnòt bè rètrìèvèd àftèrwàrd. Règènèràtìòn dèlètès thè prèvìòùs sèt ìmmèdìàtèly.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••**Fàllbàck. •••** Bàckùp còdès shòùld bè stòrèd òùtsìdè thè systèm, ànd nòt òn thè sàmè dèvìcè ùsèd tò sìgn ìn. Thèy èxìst fòr thè scènàrìò whèrè thè ùsùàl mèthòd ìs ùnàvàìlàblè. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enrolling a first second-factor method also produces eight backup codes, each of which completes one sign-in and then stops working. They exist for the sign-..." |
*
* @param {Demo_Narrative_Topic_Twofa_Backup_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_backup_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Backup_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Backup_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_backup_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_backup_body(inputs)
	return en_demo_narrative_topic_twofa_backup_body(inputs)
});