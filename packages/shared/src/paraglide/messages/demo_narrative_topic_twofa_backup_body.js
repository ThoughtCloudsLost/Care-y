/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enrolling a first second-factor method also produces eight backup codes. Each code works for one sign-in, then expires. They cover situations where the usual method is out of reach, such as a lost phone, a flat battery, or a security key left at home. [[#failure-states #privacy]]
**Hashing and one-time display.** The server stores a scrypt hash for each backup code, in the same format used for one-time codes. Passwords use a separate Argon2id hash. Codes are shown once at the moment they are generated. No route returns them afterward, so a set that was not written down can only be replaced, not recovered. Generating a new set deletes the previous set in the same operation. [[#server-holds #failure-states]]
**Storing codes away from the sign-in device.** Keep backup codes somewhere other than the device used to sign in. A code stored beside the password on the same phone reduces two factors to one. Paper in a separate physical location works. A password manager that is not unlocked by the same device lock also works. [[#privacy]]
**Second factor only, not a key.** A backup code satisfies the second factor. It does not replace the password. It plays no part in deriving encryption keys. A backup code alone opens nothing. [[#keys #trust-boundary]]
**Generation, formatting, and verification source.** Generation, formatting, normalization, and verification are in \`packages/server/src/auth/backup-codes.ts\`. The backup codes row is \`backup_codes\`, defined in \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#server-holds]]`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al activar un primer método de segundo factor también se generan ocho códigos de respaldo. Cada código funciona para un solo inicio de sesión y después caduca. Cubren situaciones en las que el método habitual no está al alcance, como un teléfono perdido, una batería agotada o una llave de seguridad olvidada en casa. [[#failure-states #privacy]]
**Hash y visualización única.** El servidor almacena un hash scrypt para cada código de respaldo, en el mismo formato que usa para códigos de un solo uso. Las contraseñas usan un hash Argon2id separado. Los códigos se muestran una sola vez en el momento en que se generan. Ninguna ruta los devuelve después, así que un conjunto que no se apuntó solo se puede reemplazar, no recuperar. Generar un conjunto nuevo elimina el anterior en la misma operación. [[#server-holds #failure-states]]
**Guardar los códigos lejos del dispositivo de inicio de sesión.** Guarda los códigos de respaldo en un lugar distinto del dispositivo con el que inicias sesión. Un código guardado junto a la contraseña en el mismo teléfono reduce dos factores a uno. Papel en una ubicación física separada funciona. Un gestor de contraseñas que no se desbloquee con el mismo bloqueo de dispositivo también funciona. [[#privacy]]
**Solo segundo factor, no una clave.** Un código de respaldo satisface el segundo factor. No sustituye la contraseña. No participa en la derivación de claves de cifrado. Un código de respaldo por sí solo no abre nada. [[#keys #trust-boundary]]
**Código fuente de generación, formato y verificación.** La generación, el formato, la normalización y la verificación están en \`packages/server/src/auth/backup-codes.ts\`. La fila de códigos de respaldo es \`backup_codes\`, definida en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ènròllìng à fìrst sècònd-fàctòr mèthòd àlsò pròdùcès èìght bàckùp còdès. Èàch còdè wòrks fòr ònè sìgn-ìn, thèn èxpìrès. Thèy còvèr sìtùàtìòns whèrè thè ùsùàl mèthòd ìs òùt òf rèàch, sùch às à lòst phònè, à flàt bàttèry, òr à sècùrìty kèy lèft àt hòmè. [[#fàìlùrè-stàtès #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hàshìng ànd ònè-tìmè dìsplày. •••••••••** Thè sèrvèr stòrès à scrypt hàsh fòr èàch bàckùp còdè, ìn thè sàmè fòrmàt ùsèd fòr ònè-tìmè còdès. Pàsswòrds ùsè à sèpàràtè Àrgòn2ìd hàsh. Còdès àrè shòwn òncè àt thè mòmènt thèy àrè gènèràtèd. Nò ròùtè rètùrns thèm àftèrwàrd, sò à sèt thàt wàs nòt wrìttèn dòwn càn ònly bè rèplàcèd, nòt rècòvèrèd. Gènèràtìng à nèw sèt dèlètès thè prèvìòùs sèt ìn thè sàmè òpèràtìòn. [[#sèrvèr-hòlds #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Stòrìng còdès àwày fròm thè sìgn-ìn dèvìcè. •••••••••••••** Kèèp bàckùp còdès sòmèwhèrè òthèr thàn thè dèvìcè ùsèd tò sìgn ìn. À còdè stòrèd bèsìdè thè pàsswòrd òn thè sàmè phònè rèdùcès twò fàctòrs tò ònè. Pàpèr ìn à sèpàràtè physìcàl lòcàtìòn wòrks. À pàsswòrd mànàgèr thàt ìs nòt ùnlòckèd by thè sàmè dèvìcè lòck àlsò wòrks. [[#prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècònd fàctòr ònly, nòt à kèy. •••••••••** À bàckùp còdè sàtìsfìès thè sècònd fàctòr. Ìt dòès nòt rèplàcè thè pàsswòrd. Ìt plàys nò pàrt ìn dèrìvìng èncryptìòn kèys. À bàckùp còdè àlònè òpèns nòthìng. [[#kèys #trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Gènèràtìòn, fòrmàttìng, ànd vèrìfìcàtìòn sòùrcè. •••••••••••••••** Gènèràtìòn, fòrmàttìng, nòrmàlìzàtìòn, ànd vèrìfìcàtìòn àrè ìn \`pàckàgès/sèrvèr/src/àùth/bàckùp-còdès.ts\`. Thè bàckùp còdès ròw ìs \`bàckùp_còdès\`, dèfìnèd ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`. [[#sèrvèr-hòlds]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enrolling a first second-factor method also produces eight backup codes. Each code works for one sign-in, then expires. They cover situations where the usual..." |
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